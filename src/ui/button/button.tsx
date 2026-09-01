import type { IButtonProps } from './button-types';
import styles from './button.module.scss';

export const Button = ({
  buttonType = 'primary',
  disabled = false,
  onClick,
  text,
  icon,
  iconPosition = 'none',
  className = '',
  htmlType = 'button',
  ...props
}: IButtonProps) => (
  <button
    className={`${styles[buttonType]} ${disabled ? styles.disabled : ''} ${className}`}
    disabled={disabled}
    onClick={onClick}
    aria-disabled={disabled}
    type={htmlType}
    {...props}
  >
    {buttonType === 'iconOnly' ? (
      <span className={styles.buttonIcon}>{icon}</span>
    ) : (
      <>
        {icon && iconPosition === 'left' && (
          <span className={styles.buttonIcon}>{icon}</span>
        )}
        {text && <span className={styles.buttonText}>{text}</span>}
        {icon && iconPosition === 'right' && (
          <span className={styles.buttonIcon}>{icon}</span>
        )}
      </>
    )}
  </button>
);
