import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { u } from '@/shared/lib/units';
import { Modal, ModalActions } from '@/shared/ui/Modal';
import { PillButton } from '@/shared/ui/PillButton';

type ConfirmDialogProps = {
  title: string;
  text: string;
  confirmLabel: string;
  onConfirm: () => void;
  /** Also what Esc and a click outside do: nothing happens. */
  onCancel: () => void;
};

/** "Are you sure?" before something that can't be undone. */
export function ConfirmDialog({
  title,
  text,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal title={title} onClose={onCancel}>
      <Text>{text}</Text>
      <ModalActions>
        <PillButton onClick={onCancel}>{t('confirm.cancel')}</PillButton>
        <PillButton onClick={onConfirm}>{confirmLabel}</PillButton>
      </ModalActions>
    </Modal>
  );
}

const Text = styled.p`
  font-size: ${({ theme }) => u(theme.typography.dialogueSize)};
  line-height: ${({ theme }) => theme.typography.lineHeight};
  color: ${({ theme }) => theme.colors.dialogueText};
`;
