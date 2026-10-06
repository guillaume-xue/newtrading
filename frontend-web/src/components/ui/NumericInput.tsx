import React from 'react';
import { InputField, InputFieldProps } from './InputField';

export interface NumericInputProps
  extends Omit<InputFieldProps, 'keyboardType' | 'onChangeText'> {
  onChangeText?: (value: string) => void;
  decimalScale?: number;
  allowNegative?: boolean;
}

export const sanitizeNumericInput = (
  value: string,
  decimalScale = 2,
  allowNegative = false,
): string => {
  const normalizedValue = value.replace(/,/g, '.');
  const sign = allowNegative && normalizedValue.startsWith('-') ? '-' : '';
  const unsignedValue = normalizedValue.replace(/-/g, '');
  const [integerPart = '', ...fractionParts] = unsignedValue.split('.');
  const hasDecimalSeparator = fractionParts.length > 0;
  const fractionPart = fractionParts.join('').slice(0, Math.max(0, decimalScale));

  return `${sign}${integerPart.replace(/[^0-9]/g, '')}${
    hasDecimalSeparator ? `.${fractionPart}` : ''
  }`;
};

export const NumericInput: React.FC<NumericInputProps> = ({
  decimalScale = 2,
  allowNegative = false,
  onChangeText,
  ...props
}) => {
  const handleChangeText = (value: string) => {
    onChangeText?.(sanitizeNumericInput(value, decimalScale, allowNegative));
  };

  return (
    <InputField
      {...props}
      keyboardType="decimal-pad"
      onChangeText={handleChangeText}
    />
  );
};
