import { CSSProperties, HTMLInputTypeAttribute, ReactNode } from 'react';
import {
	useForm,
	Controller,
	FieldValues,
	ControllerProps
} from 'react-hook-form';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { classnames } from '../../utils';

interface Option {
	label: string;
	value: any;
}

export interface Field {
	type?: HTMLInputTypeAttribute;
	name: string;
	label: string;
	required?: boolean;
	rules?: ControllerProps['rules'];
	render?: ControllerProps['render'];
	textFieldProps?: TextFieldProps;
	options?: Option[];
	defaultValue?: any;
	placeholder?: string;
}

interface FormProps {
	fields: Field[];
	onSubmit: (data: FieldValues) => void;
	children?: ReactNode;
	className?: string;
	style?: CSSProperties;
	contentClass?: string;
}

const Form = ({
	fields,
	onSubmit,
	children,
	className,
	contentClass,
	style
}: FormProps) => {
	const defaultValues = fields.reduce(
		(acc, field) => {
			acc[field.name] = field.defaultValue ?? ''; // 默认值为空字符串
			return acc;
		},
		{} as Record<string, any>
	);
	const { handleSubmit, control } = useForm({ defaultValues });

	return (
		<form
			className={classnames(className)}
			onSubmit={handleSubmit(onSubmit)}
			style={style}
			noValidate
		>
			<div className={classnames('form-content', contentClass)}>
				{fields.map((field) => (
					<Controller
						key={field.name}
						name={field.name}
						control={control}
						rules={{
							required: field.required ? `${field.label}为必填项` : false,
							...field.rules
						}}
						render={
							field.render
								? field.render
								: ({ field: controllerField, fieldState }) => (
										<TextField
											variant="outlined"
											size="small"
											fullWidth
											margin="dense"
											placeholder={field.placeholder}
											defaultValue={field.defaultValue}
											required={field.required}
											{...field.textFieldProps}
											{...controllerField}
											label={field.label}
											error={!!fieldState.error}
											helperText={
												fieldState.error ? fieldState.error.message : ''
											}
											type={field.type || 'text'}
											select={!!field.options || field.textFieldProps?.select}
										>
											{field.options
												? field.options.map((option) => (
														<option key={option.value} value={option.value}>
															{option.label}
														</option>
													))
												: void 0}
										</TextField>
									)
						}
					/>
				))}
			</div>
			{children}
		</form>
	);
};

export const BaseForm = Form;
