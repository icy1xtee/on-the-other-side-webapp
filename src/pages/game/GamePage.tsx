import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { BackgroundLayer } from '@/entities/background/ui/BackgroundLayer';
import { CharacterLayer } from '@/entities/character/ui/CharacterLayer';
import { useAdvanceDialogue } from '@/features/advance-dialogue/useAdvanceDialogue';
import { useStores } from '@/shared/lib/stores/useStores';
import { DialogueBox } from '@/widgets/dialogue-box/DialogueBox';
import { GameHeader } from '@/widgets/game-header/GameHeader';
import { NoticeToast } from '@/widgets/notice/NoticeToast';
import { Stage } from '@/widgets/stage/Stage';

/** The game screen: the engine's state drawn layer by layer, advanced by clicks and keys. */
export const GamePage = observer(function GamePage() {
  const { game, ui } = useStores();
  const { t } = useTranslation();
  const { line, visibleText, onStageClick } = useAdvanceDialogue();

  const comingSoon = (feature: string) => ui.showNotice(t('notice.comingSoon', { feature }));

  return (
    <Stage
      onClick={onStageClick}
      background={<BackgroundLayer src={game.background} />}
      sprites={<CharacterLayer sprites={game.sprites} />}
      ui={
        <>
          <GameHeader onSettings={() => comingSoon(t('header.settings'))} />
          {line && (
            <DialogueBox
              speaker={line.speaker}
              text={line.text}
              visibleText={visibleText}
              onSystemAction={(action) => comingSoon(t(`dialogue.action.${action}`))}
            />
          )}
        </>
      }
      overlay={<NoticeToast notice={ui.notice} onHide={ui.hideNotice} />}
    />
  );
});
