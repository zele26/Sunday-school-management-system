'use client';

import React, { createContext, useContext, useId } from 'react';
import { FormProvider, Controller, useFormContext } from 'react-hook-form';
import { cn } from '../utils';

export const Form = FormProvider;

const FormFieldContext = createContext({});

export const FormField = ({ name, control, render, defaultValue, shouldUnregister, rules }) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      shouldUnregister={shouldUnregister}
      rules={rules}
      render={(props) => (
        <FormFieldContext.Provider value={{ name }}>
          {render(props)}
        </FormFieldContext.Provider>
      )}
    />
  );
};

const FormItemContext = createContext({});

export const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext() || {};

  const fieldState = fieldContext?.name && getFieldState
    ? getFieldState(fieldContext.name, formState)
    : {};

  const { id } = itemContext || {};

  return {
    id,
    name: fieldContext?.name,
    formItemId: id ? `${id}-form-item` : undefined,
    formDescriptionId: id ? `${id}-form-item-description` : undefined,
    formMessageId: id ? `${id}-form-item-message` : undefined,
    ...fieldState,
  };
};

export const FormItem = React.forwardRef(({ className, ...props }, ref) => {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn('space-y-1.5', className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

export const FormLabel = React.forwardRef(({ className, required, children, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <label
      ref={ref}
      className={cn(
        'text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 block mb-1',
        error && 'text-rose-500 dark:text-rose-400',
        className
      )}
      htmlFor={formItemId}
      {...props}
    >
      {children}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  );
});
FormLabel.displayName = 'FormLabel';

export const FormControl = React.forwardRef(({ children, ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  if (!React.isValidElement(children)) {
    return null;
  }

  return React.cloneElement(children, {
    ref,
    id: formItemId,
    'aria-describedby': error
      ? `${formDescriptionId} ${formMessageId}`
      : `${formDescriptionId}`,
    'aria-invalid': !!error,
    ...(children.props.error !== undefined ? {} : { error: error ? error.message : undefined }),
    ...props,
  });
});
FormControl.displayName = 'FormControl';

export const FormDescription = React.forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-xs text-slate-500 dark:text-slate-400', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

export const FormMessage = React.forwardRef(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message || '') : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-xs font-medium text-rose-500 dark:text-rose-400 mt-1 animate-in fade-in-50', className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';
