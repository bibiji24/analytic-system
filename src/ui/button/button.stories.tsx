import type { Meta, StoryObj } from '@storybook/react';
import EditIcon from '@icons/edit.svg?url';
import GoogleIcon from '@icons/Google.svg?url';
import { Button } from './button';

// Метаданные компонента
const meta: Meta<typeof Button> = {
  title: 'Shared/UI/Button', // Путь в сторибуке
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'], // Автоматическая генерация документации
  argTypes: {
    buttonType: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Тип кнопки'
    },
    text: {
      control: 'text',
      description: 'Текст кнопки'
    },
    icon: {
      control: 'object',
      description: 'React-нода иконки'
    },
    iconPosition: {
      control: 'radio',
      options: ['left', 'right'],
      description: 'Позиция иконки относительно текста'
    },
    disabled: {
      control: 'boolean',
      description: 'Состояние disabled'
    },
    onClick: {
      action: 'clicked',
      description: 'Обработчик клика'
    }
  }
};

export default meta;

// Базовый шаблон
type Story = StoryObj<typeof Button>;

// Основные истории
export const Primary: Story = {
  args: {
    buttonType: 'primary',
    text: 'Primary Button'
  }
};

export const Secondary: Story = {
  args: {
    buttonType: 'secondary',
    text: 'Secondary Button'
  }
};

export const Tertiary: Story = {
  args: {
    buttonType: 'tertiary',
    text: 'Tertiary Button'
  }
};

export const WithIconLeft: Story = {
  args: {
    buttonType: 'primary',
    text: 'Редактировать',
    icon: (
      <img
        src={EditIcon}
        alt='Edit'
        style={{ width: '20px', height: '20px' }}
      />
    ),
    iconPosition: 'left'
  }
};

export const WithIconRight: Story = {
  args: {
    buttonType: 'primary',
    text: 'Редактировать',
    icon: (
      <img
        src={EditIcon}
        alt='Edit'
        style={{ width: '20px', height: '20px' }}
      />
    ),
    iconPosition: 'right'
  }
};

export const Disabled: Story = {
  args: {
    buttonType: 'primary',
    text: 'Disabled Button',
    disabled: true
  }
};

export const IconOnly: Story = {
  args: {
    buttonType: 'iconOnly',
    icon: (
      <img
        src={GoogleIcon}
        alt='Google'
        style={{ width: '24px', height: '24px' }}
      />
    ),
    text: '' // Пустой текст
  }
};
