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
import { languages } from '@codemirror/language-data';
import { LanguageDescription } from '@codemirror/language';
import { useEffect, useState } from '@docucraft/srender';
import SvgArticle from '@docucraft/icons/svg/ArticleFill';

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

export interface LangPickerProps {
	onChange?: (l: LanguageType | null) => void;
	value?: string;
}

export default function LangPicker({ onChange, value: val }: LangPickerProps) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);
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

	useEffect(() => {
		if (val && val !== value) {
			const lang = languages.find((item) => item.name.toLowerCase() === val);
			if (lang) setValue(lang);
		}
	}, [val]);

	const open = Boolean(anchorEl);
	const id = open ? 'language-picker' : undefined;

	return (
		<>
			<Box sx={{ fontSize: 12 }}>
				<Button
					sx={{ paddingBottom: 0 }}
					disableRipple
					aria-describedby={id}
					onClick={handleClick}
				>
					<span>{value?.name || 'plaintext'}</span>
				</Button>
			</Box>
			<StyledPopper
				id={id}
				open={open}
				anchorEl={anchorEl}
				placement="bottom-start"
			>
				<ClickAwayListener onClickAway={handleClose}>
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
								// setInputValue(newValue?.name || '');
								if (onChange) onChange(newValue);
								handleClose();
							}}
							ListboxProps={{ className: 'scrollbar' }}
							renderTags={() => null}
							noOptionsText="No option"
							renderOption={(props, option, { selected }) => {
								const { key, ...optionProps } = props;

								return (
									<li key={key} {...optionProps}>
										<Box
											component="span"
											sx={{
												'& svg': {
													width: 24,
													height: 24,
													borderRadius: '3px'
												},
												flexShrink: 0,
												mr: 1,
												mt: '2px'
											}}
										>
											{(<LogoCmp name={option.name} />) as any}
										</Box>
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
									</li>
								) as any;
							}}
							options={[...languages]}
							getOptionLabel={(option) => option.name}
							renderInput={(params) => (
								<StyledInput
									ref={params.InputProps.ref}
									inputProps={params.inputProps}
									autoFocus
									placeholder="Filter language"
									onChange={(e: any) => {
										setInputValue(e.target?.value);
									}}
								/>
							)}
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

function capitalizeFirstLetter(str: string) {
	if (!str) return str; // 处理空字符串
	return str.charAt(0).toUpperCase() + str.slice(1);
}

const LogoCmp = ({ name }: { name: string }) => {
	const [logo, setIcon] = useState({ Icon: SvgArticle });

	useEffect(() => {
		const filename = capitalizeFirstLetter(langMap[name] || name);
		import('@docucraft/icons/logo/' + filename).then(
			(m) => setIcon({ Icon: m.default }),
			(e) => {}
		);
	}, []);

	return <logo.Icon />;
};

const langMap: Record<string, string> = {
	C: 'c',
	'C++': 'cplusplus',
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
	TSX: 'react',
	TypeScript: 'typescript',
	Shell: 'bash',
	PowerShell: 'powershell',
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
	'VB.NET': 'vbnet',
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
	TOML: 'toml',
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
	AppleScript: 'applescript',
	Vue: 'vuejs',
	'C#': 'csharp',
	WebAssembly: 'wasm',
	XML: 'xml',
	ClojureScript: 'clojurescript',
	'Angular Template': 'angularjs',
	Pascal: 'pascal',
	HTTP: 'http',
	ProtoBuf: 'protobuf',
	Asterisk: 'asterisk',
	Cypher: 'cypher',
	Cython: 'cython',
	DTD: 'dtd',
	IDL: 'idl',
	'Web IDL': 'idl',
	'Properties files': 'ini',
	'JSON-LD': 'jsonld',
	LiveScript: 'livescript',
	PGP: 'pgp',
	'RPM Changes': 'rpm',
	'RPM Spec': 'rpm',
	Solr: 'solr',
	APL: 'apl'
};
