import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Modal } from './Modal';
import { useState } from 'react';
import { withDesign } from 'storybook-addon-designs';
import { Button } from 'components/button/Button';

export default {
  title: 'Components/Modal/Normal',
  component: Modal,
  decorators: [withDesign],
} as ComponentMeta<typeof Modal>;

const Template: ComponentStory<typeof Modal> = (args) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal {...args} isOpen={isOpen} setIsOpen={setIsOpen}>
        <p>some content</p>
      </Modal>
    </>
  );
};

export const Open = Template.bind({});
Open.args = {
  isOpen: true,
  setIsOpen: () => {},
  title: 'Modal title',
};

Open.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/fwADI9wqDrRAdlMX8EddCw/Bancor-v3?node-id=7879%3A257081',
  },
};
