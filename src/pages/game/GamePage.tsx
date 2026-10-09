import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { BackgroundLayer } from '@/entities/background/ui/BackgroundLayer';
import { CharacterLayer } from '@/entities/character/ui/CharacterLayer';
import { useAdvanceDialogue } from '@/features/advance-dialogue/useAdvanceDialogue';
import { ChoiceList } from '@/features/make-choice/ChoiceList';
import { useStores } from '@/shared/lib/stores/useStores';
import { DialogueBox } from '@/widgets/dialogue-box/DialogueBox';
import { GameHeader } from '@/widgets/game-header/GameHeader';
import { NoticeToast } from '@/widgets/notice/NoticeToast';
import { Stage } from '@/widgets/stage/Stage';

/**
 * The game screen: the engine's state drawn layer by layer, advanced by clicks and keys. At a
 * choice the panel first shows its prompt like any line; once the player has read it, the
 * options come out under it.
 */
export const GamePage = observer(function GamePage() {
  const { game, ui } = useStores();
  const { t } = useTranslation();
  const { line, visibleText, choiceOptions: options, onStageClick } = useAdvanceDialogue();

  const comingSoon = (feature: string) => ui.showNotice(t('notice.comingSoon', { feature }));

  return (
    <Stage
      onClick={onStageClick}
      background={<BackgroundLayer src={game.background} />}
      sprites={<CharacterLayer sprites={game.sprites} />}
      ui={
        <>
          <GameHeader onSettings={() => comingSoon(t('header.settings'))} />
          {(line || options) && (
            <DialogueBox
              speaker={line?.speaker ?? null}
              text={line?.text ?? ''}
              visibleText={visibleText}
              choice={options && <ChoiceList options={options} onChoose={game.choose} />}
              onSystemAction={(action) => comingSoon(t(`dialogue.action.${action}`))}
            />
          )}
        </>
      }
      overlay={<NoticeToast notice={ui.notice} onHide={ui.hideNotice} />}
    />
  );
});
