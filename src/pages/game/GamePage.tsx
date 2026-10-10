import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { BackgroundLayer } from '@/entities/background/ui/BackgroundLayer';
import { CharacterLayer } from '@/entities/character/ui/CharacterLayer';
import { useAdvanceDialogue } from '@/features/advance-dialogue/useAdvanceDialogue';
import { ChoiceList } from '@/features/make-choice/ChoiceList';
import { useStores } from '@/shared/lib/stores/useStores';
import { DialogueBox, type SystemAction } from '@/widgets/dialogue-box/DialogueBox';
import { GameHeader } from '@/widgets/game-header/GameHeader';
import { NoticeToast } from '@/widgets/notice/NoticeToast';
import { SettingsOverlay } from '@/widgets/settings-overlay/SettingsOverlay';
import { Stage } from '@/widgets/stage/Stage';

/**
 * The game screen: the engine's state drawn layer by layer, advanced by clicks and keys. At a
 * choice the panel first shows its prompt like any line; once the player has read it, the
 * options come out under it.
 */
export const GamePage = observer(function GamePage() {
  const { game, ui, toMainMenu } = useStores();
  const { t } = useTranslation();
  const { line, visibleText, choiceOptions: options, onStageClick } = useAdvanceDialogue();

  const comingSoon = (feature: string) => ui.showNotice(t('notice.comingSoon', { feature }));

  // The game saves itself on every line; the Save button does it at once and says so. Loading
  // is "Продолжить" in the menu: one slot in 0.1, a load screen comes with slots.
  const onSystemAction = (action: SystemAction) => {
    if (action === 'save') {
      ui.showNotice(game.saveNow() ? t('notice.saved') : t('notice.saveFailed'));
    } else {
      comingSoon(t(`dialogue.action.${action}`));
    }
  };

  return (
    <Stage
      modal={ui.overlay !== null}
      onClick={onStageClick}
      background={<BackgroundLayer src={game.background} />}
      sprites={<CharacterLayer sprites={game.sprites} />}
      ui={
        <>
          <GameHeader onSettings={ui.openSettings} />
          {(line || options) && (
            <DialogueBox
              speaker={line?.speaker ?? null}
              text={line?.text ?? ''}
              visibleText={visibleText}
              choice={options && <ChoiceList options={options} onChoose={game.choose} />}
              onSystemAction={onSystemAction}
            />
          )}
        </>
      }
      overlay={
        <>
          {ui.overlay === 'settings' && (
            <SettingsOverlay onClose={ui.closeOverlay} onMainMenu={toMainMenu} />
          )}
          <NoticeToast notice={ui.notice} onHide={ui.hideNotice} />
        </>
      }
    />
  );
});
