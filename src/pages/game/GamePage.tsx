import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { useAdvanceDialogue } from '@/features/advance-dialogue/useAdvanceDialogue';
import { useReadingModes } from '@/features/advance-dialogue/useReadingModes';
import { ChoiceList } from '@/features/make-choice/ChoiceList';
import { MENU_SECTIONS } from '@/shared/config/gameMenu';
import { formatPlayTime } from '@/shared/lib/format';
import { useStores } from '@/shared/lib/stores/useStores';
import { useNow } from '@/shared/lib/useNow';
import { usePageVisible } from '@/shared/lib/usePageVisible';
import { DialogueBox, type SystemAction } from '@/widgets/dialogue-box/DialogueBox';
import { GameHeader } from '@/widgets/game-header/GameHeader';
import { GameMenu } from '@/widgets/game-menu/GameMenu';
import { ModeIndicator } from '@/widgets/mode-indicator/ModeIndicator';
import { NoticeToast } from '@/widgets/notice/NoticeToast';
import { SceneView } from '@/widgets/scene-view/SceneView';
import { Stage } from '@/widgets/stage/Stage';

/**
 * The game screen: the engine's state drawn layer by layer, advanced by clicks and keys. At a
 * choice the panel first shows its prompt like any line; once the player has read it, the
 * options come out under it.
 */
export const GamePage = observer(function GamePage() {
  const { game, saves, reading, ui, settings, toMainMenu } = useStores();
  const theme = useTheme();
  const { t } = useTranslation();
  const { line, visibleText, choiceOptions: options, onStageClick } = useAdvanceDialogue();

  // Play time runs while the player is here: not in a hidden tab, not in the game menu. So do
  // Auto and Skip.
  const visible = usePageVisible();
  const counting = visible && ui.overlay === null;
  useEffect(() => {
    if (!counting) {
      return;
    }
    saves.startClock();
    return () => saves.stopClock();
  }, [counting, saves]);
  useReadingModes(counting);

  const comingSoon = (feature: string) => ui.showNotice(t('notice.comingSoon', { feature }));

  // «Назад» rolls back, Auto and Skip switch their modes, «История» opens the history. The game
  // saves itself on every line; the Save button does it at once and says so. Load comes with the
  // save slots.
  const onSystemAction = (action: SystemAction) => {
    if (action === 'back') {
      reading.rollBack();
    } else if (action === 'auto') {
      reading.toggleAuto();
    } else if (action === 'skip') {
      reading.toggleSkip();
    } else if (action === 'history') {
      ui.openGameMenu('history');
    } else if (action === 'save') {
      const saved = saves.saveNow();
      ui.showNotice(saved ? t('notice.saved') : t('notice.saveFailed'), saved ? 'info' : 'error');
    } else {
      comingSoon(t(`dialogue.action.${action}`));
    }
  };

  const pressed = new Set<SystemAction>();
  if (reading.mode === 'auto') {
    pressed.add('auto');
  }
  if (reading.skipping) {
    pressed.add('skip');
  }
  const inactive = new Set<SystemAction>(game.canRollBack ? [] : ['back']);

  const overlay = ui.overlay;

  return (
    <Stage
      modal={overlay !== null}
      onClick={onStageClick}
      scene={<SceneView {...game.frame} instant={reading.skipping || game.travelled} />}
      ui={
        <>
          <GameHeader
            onSettings={() => ui.openGameMenu('settings')}
            onProfile={() => ui.showNotice(t('notice.profileLater'))}
          />
          <ModeIndicator mode={reading.skipping ? 'skip' : reading.mode} />
          {(line || options) && (
            <DialogueBox
              speaker={line?.speaker ?? null}
              text={line?.text ?? ''}
              visibleText={visibleText}
              choice={options && <ChoiceList options={options} onChoose={reading.choose} />}
              textSize={theme.typography.dialogueSizes[settings.textSize]}
              opacity={settings.windowOpacity}
              meta={<PlayMeta />}
              onSystemAction={onSystemAction}
              pressed={pressed}
              inactive={inactive}
              onVoice={() => ui.showNotice(t('notice.voiceLater'))}
            />
          )}
        </>
      }
      overlay={
        <>
          {overlay?.type === 'gameMenu' && (
            <GameMenu
              section={overlay.section}
              sections={MENU_SECTIONS}
              onSection={ui.showMenuSection}
              onClose={ui.closeOverlay}
              onMainMenu={toMainMenu}
            />
          )}
          <NoticeToast notice={ui.notice} onHide={ui.hideNotice} />
        </>
      }
    />
  );
});

/** The scene's title and the play time, ticking every second: only this line re-renders. */
const PlayMeta = observer(function PlayMeta() {
  const { game, saves } = useStores();
  const { t } = useTranslation('story');
  const now = useNow(1000);
  const title = game.sceneTitle && t(game.sceneTitle);
  return [title, formatPlayTime(saves.playTime(now))].filter(Boolean).join(' · ');
});
