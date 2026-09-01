import React from 'react';

type TButtonType = 'primary' | 'secondary' | 'tertiary' | 'iconOnly';
type TIconPosition = 'left' | 'right' | 'none';
type THtmlType = 'button' | 'submit' | 'reset';

export interface IButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  buttonType?: TButtonType;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  text?: string | React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: TIconPosition;
  className?: string;
  htmlType?: THtmlType;
}
