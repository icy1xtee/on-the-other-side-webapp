import { observer } from 'mobx-react-lite';
import { BackgroundLayer } from '@/entities/background/ui/BackgroundLayer';
import { CharacterLayer } from '@/entities/character/ui/CharacterLayer';
import { useAdvanceDialogue } from '@/features/advance-dialogue/useAdvanceDialogue';
import { useStores } from '@/shared/lib/stores/useStores';
import { DialogueBox } from '@/widgets/dialogue-box/DialogueBox';
import { GameHeader } from '@/widgets/game-header/GameHeader';
import { Stage } from '@/widgets/stage/Stage';

/** The game screen: the engine's frame drawn layer by layer, advanced by clicks and keys. */
export const GamePage = observer(function GamePage() {
  const { game } = useStores();
  const { line, visibleText, onStageClick } = useAdvanceDialogue();

  return (
    <Stage
      onClick={onStageClick}
      background={<BackgroundLayer src={game.background} />}
      sprites={<CharacterLayer sprites={game.sprites} />}
      ui={
        <>
          <GameHeader />
          {line && (
            <DialogueBox speaker={line.speaker} text={line.text} visibleText={visibleText} />
          )}
        </>
      }
    />
  );
});
