import { useTranslation } from 'react-i18next';
import type { SlotQuestion } from '@/shared/config/saveSlots';
import { useStores } from '@/shared/lib/stores/useStores';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

/**
 * The question over the game menu before what can't be undone: overwriting a slot or deleting it
 * (in red), loading a save over the game on screen.
 */
export function SlotQuestionDialog({ question }: { question: SlotQuestion }) {
  const { ui, confirmQuestion } = useStores();
  const { t } = useTranslation();

  const { type } = question;
  const slot = type === 'load' ? undefined : question.slot;
  return (
    <ConfirmDialog
      title={t(`confirm.${type}.title`, { slot })}
      text={t(`confirm.${type}.text`, { slot })}
      confirmLabel={t(`confirm.${type}.confirm`)}
      tone={type === 'load' ? 'primary' : 'danger'}
      onConfirm={confirmQuestion}
      onCancel={ui.dismissQuestion}
    />
  );
}
