import React from 'react';

type ButtonType = 'primary' | 'secondary' | 'tertiary';
type IconPosition = 'left' | 'right' | 'none';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  buttonType?: ButtonType;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  text?: string;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  className?: string;
}
