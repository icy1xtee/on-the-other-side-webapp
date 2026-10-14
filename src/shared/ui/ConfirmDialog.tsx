import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { u } from '@/shared/lib/units';
import { ActionButton } from '@/shared/ui/ActionButton';
import { Modal } from '@/shared/ui/Modal';

type ConfirmDialogProps = {
  title: string;
  text: string;
  confirmLabel: string;
  /** `danger` for what can't be undone — overwriting, deleting. */
  tone?: 'primary' | 'danger';
  onConfirm: () => void;
  /** Also what Esc and a click outside do: nothing happens. */
  onCancel: () => void;
};

/** "Are you sure?" before something that can't be undone. */
export function ConfirmDialog({
  title,
  text,
  confirmLabel,
  tone = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const titleId = useId();

  return (
    <Dialog role="alertdialog" labelledBy={titleId} onClose={onCancel}>
      <Title id={titleId}>{title}</Title>
      {text && <Text>{text}</Text>}
      <Actions>
        <ActionButton onClick={onCancel}>{t('confirm.cancel')}</ActionButton>
        <ActionButton $tone={tone} onClick={onConfirm}>
          {confirmLabel}
        </ActionButton>
      </Actions>
    </Dialog>
  );
}

const Dialog = styled(Modal)`
  width: ${({ theme }) => u(theme.dialog.width)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => u(theme.dialog.gap)};
  padding: ${({ theme }) =>
    `${u(theme.dialog.paddingTop)} ${u(theme.dialog.paddingRight)} ${u(theme.dialog.paddingBottom)} ${u(theme.dialog.paddingLeft)}`};
  border: 1px solid ${({ theme }) => theme.colors.dialogBorder};
  border-radius: ${({ theme }) => u(theme.dialog.radius)};
  background: ${({ theme }) => theme.surfaces.dialog};
  box-shadow: ${({ theme }) => theme.shadows.dialog};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => u(theme.typography.dialogTitleSize)};
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.textStrong};
  text-wrap: pretty;
`;

const Text = styled.p`
  font-size: ${({ theme }) => u(theme.typography.bodySize)};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-wrap: pretty;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => u(theme.dialog.actionsGap)};
  margin-top: ${({ theme }) => u(theme.dialog.actionsTop)};
`;
