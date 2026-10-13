import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { useAdvanceDialogue } from '@/features/advance-dialogue/useAdvanceDialogue';
import { ChoiceList } from '@/features/make-choice/ChoiceList';
import { MENU_SECTIONS } from '@/shared/config/gameMenu';
import { formatPlayTime } from '@/shared/lib/format';
import { useStores } from '@/shared/lib/stores/useStores';
import { useNow } from '@/shared/lib/useNow';
import { usePageVisible } from '@/shared/lib/usePageVisible';
import { DialogueBox, type SystemAction } from '@/widgets/dialogue-box/DialogueBox';
import { GameHeader } from '@/widgets/game-header/GameHeader';
import { GameMenu } from '@/widgets/game-menu/GameMenu';
import { NoticeToast } from '@/widgets/notice/NoticeToast';
import { SceneView } from '@/widgets/scene-view/SceneView';
import { Stage } from '@/widgets/stage/Stage';

/**
 * The game screen: the engine's state drawn layer by layer, advanced by clicks and keys. At a
 * choice the panel first shows its prompt like any line; once the player has read it, the
 * options come out under it.
 */
export const GamePage = observer(function GamePage() {
  const { game, ui, settings, toMainMenu } = useStores();
  const theme = useTheme();
  const { t } = useTranslation();
  const { line, visibleText, choiceOptions: options, onStageClick } = useAdvanceDialogue();

  // Play time runs while the player is here: not in a hidden tab, not in the game menu.
  const visible = usePageVisible();
  const counting = visible && ui.overlay === null;
  useEffect(() => {
    if (!counting) {
      return;
    }
    game.startClock();
    return () => game.stopClock();
  }, [counting, game]);

  const comingSoon = (feature: string) => ui.showNotice(t('notice.comingSoon', { feature }));

  // The game saves itself on every line; the Save button does it at once and says so. The rest
  // come with their stages of this version.
  const onSystemAction = (action: SystemAction) => {
    if (action === 'save') {
      const saved = game.saveNow();
      ui.showNotice(saved ? t('notice.saved') : t('notice.saveFailed'), saved ? 'info' : 'error');
    } else {
      comingSoon(t(`dialogue.action.${action}`));
    }
  };

  const overlay = ui.overlay;

  return (
    <Stage
      modal={overlay !== null}
      onClick={onStageClick}
      scene={<SceneView background={game.background} sprites={game.sprites} />}
      ui={
        <>
          <GameHeader
            onSettings={() => ui.openGameMenu('settings')}
            onProfile={() => ui.showNotice(t('notice.profileLater'))}
          />
          {(line || options) && (
            <DialogueBox
              speaker={line?.speaker ?? null}
              text={line?.text ?? ''}
              visibleText={visibleText}
              choice={options && <ChoiceList options={options} onChoose={game.choose} />}
              textSize={theme.typography.dialogueSizes[settings.textSize]}
              opacity={settings.windowOpacity}
              meta={<PlayMeta />}
              onSystemAction={onSystemAction}
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
  const { game } = useStores();
  const { t } = useTranslation('story');
  const now = useNow(1000);
  const title = game.sceneTitle && t(game.sceneTitle);
  return [title, formatPlayTime(game.playTime(now))].filter(Boolean).join(' · ');
});
