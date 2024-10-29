import { useTheme, styled } from '@mui/material/styles';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Autocomplete, {
	AutocompleteCloseReason,
	autocompleteClasses
} from '@mui/material/Autocomplete';
import ButtonBase from '@mui/material/ButtonBase';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import Close from '@docucraft/icons/svg/Close';
import DoneIcon from '@docucraft/icons/svg/Done';
import SettingsIcon from '@docucraft/icons/svg/Settings';
import { languages } from '@codemirror/language-data';
import { LanguageDescription } from '@codemirror/language';
import { useState } from '@docucraft/srender';

interface PopperComponentProps {
	anchorEl?: any;
	disablePortal?: boolean;
	open: boolean;
}

const StyledAutocompletePopper = styled('div')(({ theme }) => ({
	[`& .${autocompleteClasses.paper}`]: {
		boxShadow: 'none',
		margin: 0,
		color: 'inherit',
		fontSize: 13
	},
	[`& .${autocompleteClasses.listbox}`]: {
		backgroundColor: '#fff',

		padding: 0,
		[`& .${autocompleteClasses.option}`]: {
			minHeight: 'auto',
			alignItems: 'flex-start',
			padding: 8,
			borderBottom: `1px solid  ${' #eaecef'}`,

			'&[aria-selected="true"]': {
				backgroundColor: 'transparent'
			},
			[`&.${autocompleteClasses.focused}, &.${autocompleteClasses.focused}[aria-selected="true"]`]:
				{
					backgroundColor: theme.palette.action.hover
				},
			...theme.applyStyles('dark', {
				borderBottom: `1px solid  ${'#30363d'}`
			})
		},
		...theme.applyStyles('dark', {
			backgroundColor: '#1c2128'
		})
	},
	[`&.${autocompleteClasses.popperDisablePortal}`]: {
		position: 'relative'
	}
}));

function PopperComponent(props: PopperComponentProps) {
	const { disablePortal, anchorEl, open, ...other } = props;
	// @ts-ignore
	return <StyledAutocompletePopper {...other} />;
}

const StyledPopper = styled(Popper)(({ theme }) => ({
	border: `1px solid ${'#e1e4e8'}`,
	boxShadow: `0 8px 24px ${'rgba(149, 157, 165, 0.2)'}`,
	color: '#24292e',
	backgroundColor: '#fff',
	borderRadius: 6,
	width: 300,
	zIndex: theme.zIndex.modal,
	fontSize: 13,
	...theme.applyStyles('dark', {
		border: `1px solid ${'#30363d'}`,
		boxShadow: `0 8px 24px ${'rgb(1, 4, 9)'}`,
		color: '#c9d1d9',
		backgroundColor: '#1c2128'
	})
}));

const StyledInput = styled(InputBase as any)(({ theme }) => ({
	padding: 10,
	width: '100%',
	borderBottom: `1px solid ${'#30363d'}`,
	'& input': {
		borderRadius: 4,
		backgroundColor: '#fff',
		border: `1px solid ${'#30363d'}`,
		padding: 8,
		transition: theme.transitions.create(['border-color', 'box-shadow']),
		fontSize: 14,
		'&:focus': {
			boxShadow: `0px 0px 0px 3px ${'rgba(3, 102, 214, 0.3)'}`,
			borderColor: '#0366d6',
			...theme.applyStyles('dark', {
				boxShadow: `0px 0px 0px 3px ${'rgb(12, 45, 107)'}`,
				borderColor: '#388bfd'
			})
		},
		...theme.applyStyles('dark', {
			backgroundColor: '#0d1117',
			border: `1px solid ${'#eaecef'}`
		})
	},
	...theme.applyStyles('dark', {
		borderBottom: `1px solid ${'#eaecef'}`
	})
}));

const Button = styled(ButtonBase as any)(({ theme }) => ({
	fontSize: 13,
	width: '100%',
	textAlign: 'left',
	paddingBottom: 8,
	color: '#586069',
	fontWeight: 600,
	'&:hover,&:focus': {
		color: '#0366d6',
		...theme.applyStyles('dark', {
			color: '#58a6ff'
		})
	},
	'& span': {
		width: '100%'
	},
	'& svg': {
		width: 16,
		height: 16
	},
	...theme.applyStyles('dark', {
		color: '#8b949e'
	})
}));

export default function LangPicker() {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [value, setValue] = useState<LanguageType | null>(null);
	const [inputValue, setInputValue] = useState('');
	// const [pendingValue, setPendingValue] = React.useState<[]>([]);
	const theme = useTheme();

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		// setPendingValue(value);
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		// setValue(pendingValue);
		if (anchorEl) {
			anchorEl.focus();
		}
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'language-picker' : undefined;

	return (
		<>
			{/* @ts-ignore */}
			<Box sx={{ fontSize: 12 }}>
				{/* @ts-ignore */}
				<Button
					sx={{ paddingBottom: 0 }}
					disableRipple
					aria-describedby={id}
					onClick={handleClick}
				>
					<span>{value?.name || 'plaintext'}</span>
				</Button>
			</Box>
			{/* @ts-ignore */}
			<StyledPopper
				id={id}
				open={open}
				anchorEl={anchorEl}
				placement="bottom-start"
			>
				{/* @ts-ignore */}
				<ClickAwayListener onClickAway={handleClose}>
					{/* @ts-ignore */}
					<div>
						<Box
							sx={(t) => ({
								borderBottom: `1px solid ${'#30363d'}`,
								padding: '8px 10px',
								fontWeight: 600,
								...t.applyStyles('light', {
									borderBottom: `1px solid ${'#eaecef'}`
								})
							})}
						>
							选择文本格式
						</Box>
						<Autocomplete
							open
							onClose={(_, reason: AutocompleteCloseReason) => {
								if (reason === 'escape') {
									handleClose();
								}
							}}
							inputValue={inputValue}
							onChange={(event, newValue, reason): void => {
								if (
									reason === 'clear' ||
									(event.type === 'keydown' &&
										((event as React.KeyboardEvent).key === 'Backspace' ||
											(event as React.KeyboardEvent).key === 'Delete') &&
										reason === 'removeOption')
								) {
									return;
								}
								setValue(newValue);
								setInputValue(newValue?.name || '');
								handleClose();
							}}
							ListboxProps={{ className: 'scrollbar' }}
							// disableCloseOnSelect
							renderTags={() => null}
							noOptionsText="No option"
							renderOption={(props, option, { selected }) => {
								const { key, ...optionProps } = props;

								return (
									// @ts-ignore
									<li key={key} {...optionProps}>
										{/* <Box
											component={DoneIcon}
											sx={{ width: 17, height: 17, mr: '5px', ml: '-2px' }}
											style={{
												visibility: selected ? 'visible' : 'hidden'
											}}
										/> */}
										{/* <Box
											component="span"
											sx={{
												width: 14,
												height: 14,
												flexShrink: 0,
												borderRadius: '3px',
												mr: 1,
												mt: '2px'
											}}
											style={{ backgroundColor: option.color }}
										/> */}
										{/* @ts-ignore */}
										<Box
											sx={(t) => ({
												flexGrow: 1,
												'& span': {
													color: '#8b949e',
													...t.applyStyles('light', {
														color: '#586069'
													})
												}
											})}
										>
											{option.name}
											<br />
											{option.extensions.length > 0 && (
												<span>ext: {option.extensions.join(', ')}</span>
											)}
										</Box>
										{/* <Box
											component={Close}
											sx={{ opacity: 0.6, width: 18, height: 18 }}
											style={{
												visibility: selected ? 'visible' : 'hidden'
											}}
										/> */}
									</li>
								) as any;
							}}
							options={[...languages]}
							getOptionLabel={(option) => option.name}
							renderInput={(params) =>
								(
									// @ts-ignore
									<StyledInput
										ref={params.InputProps.ref}
										inputProps={params.inputProps}
										autoFocus
										placeholder="Filter language"
										onChange={(e: any) => {
											setInputValue(e.target?.value);
										}}
									/>
								) as any
							}
							slots={{
								popper: PopperComponent as any
							}}
						/>
					</div>
				</ClickAwayListener>
			</StyledPopper>
		</>
	);
}

interface LanguageType extends LanguageDescription {}

const langMap = {
	C: 'c',
	'C++': 'cpp',
	CQL: 'cassandra',
	CSS: 'css3',
	Go: 'go',
	HTML: 'html5',
	Java: 'java',
	JavaScript: 'javascript',
	JSON: 'json',
	JSX: 'react',
	LESS: 'less',
	Liquid: 'liquid',
	Markdown: 'markdown',
	'MariaDB SQL': 'mariadb',
	'MS SQL': 'microsoftsqlserver',
	MySQL: 'mysql',
	PHP: 'php',
	PLSQL: 'oracle',
	PostgreSQL: 'postgresql',
	Python: 'python',
	Rust: 'rust',
	Sass: 'sass',
	SCSS: 'sass',
	SQL: 'mysql',
	SQLite: 'sqlite',
	TSX: 'typescript',
	TypeScript: 'typescript',
	Shell: 'bash',
	Dockerfile: 'docker',
	YAML: 'yaml',
	Perl: 'perl',
	Ruby: 'ruby',
	Swift: 'swift',
	Lua: 'lua',
	R: 'r',
	Kotlin: 'kotlin',
	Haskell: 'haskell',
	Elixir: 'elixir',
	Dart: 'dart',
	'VB.NET': 'dot-net',
	'Objective-C': 'objectivec',
	Groovy: 'groovy',
	Apache: 'apache',
	Nginx: 'nginx',
	Powershell: 'powershell',
	Fortran: 'fortran',
	COBOL: 'cobol',
	MATLAB: 'matlab',
	Julia: 'julia',
	TCL: 'tcl',
	VHDL: 'vhdl',
	Verilog: 'verilog',
	Scala: 'scala',
	Erlang: 'erlang',
	Crystal: 'crystal',
	'F#': 'fsharp',
	'Common Lisp': 'lisp',
	Prolog: 'prolog',
	Racket: 'racket',
	Bash: 'bash',
	Handlebars: 'handlebars',
	HAML: 'haml',
	Twig: 'twig',
	Smarty: 'smarty',
	Mustache: 'mustache',
	AsciiDoc: 'asciidoc',
	LaTeX: 'latex',
	reStructuredText: 'restructuredtext',
	Textile: 'textile',
	Toml: 'toml',
	Nim: 'nim',
	OCaml: 'ocaml',
	AutoHotkey: 'autohotkey',
	SML: 'sml',
	QML: 'qt',
	CoffeeScript: 'coffeescript',
	XQuery: 'xquery',
	Solidity: 'solidity',
	Gradle: 'gradle',
	CMake: 'cmake',
	XSLT: 'xslt',
	ActionScript: 'actionscript',
	Haxe: 'haxe',
	VBScript: 'vbscript',
	AppleScript: 'applescript'
};
