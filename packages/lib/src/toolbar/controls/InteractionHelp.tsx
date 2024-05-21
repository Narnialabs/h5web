import {
  autoUpdate,
  offset,
  shift,
  useClick,
  useFloating,
  useInteractions,
} from '@floating-ui/react';
import { useToggle } from '@react-hookz/web';
import { useId } from 'react';
import { FiHelpCircle } from 'react-icons/fi';

import type { InteractionInfo } from '../../interactions/models';
import toolbarStyles from '../Toolbar.module.css';
import { useFloatingDismiss } from './hooks';
import styles from './InteractionHelp.module.css';

interface Props {
  interactions: InteractionInfo[];
}

function InteractionHelp(props: Props) {
  const { interactions } = props;

  const [isOpen, toggle] = useToggle();
  const referenceId = useId();

  const { refs, floatingStyles, context } = useFloating<HTMLButtonElement>({
    open: isOpen,
    middleware: [offset(6), shift({ padding: 6 })],
    onOpenChange: toggle,
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useFloatingDismiss(context),
  ]);

  return (
    <>
      <button
        ref={refs.setReference}
        id={referenceId}
        className={toolbarStyles.btn}
        type="button"
        title="Show help"
        aria-label="Show help"
        aria-haspopup="dialog"
        aria-expanded={isOpen || undefined}
        aria-controls={(isOpen && context.floatingId) || undefined}
        {...getReferenceProps()}
      >
        <span className={toolbarStyles.btnLike}>
          <FiHelpCircle className={toolbarStyles.icon} />
        </span>
      </button>

      {isOpen && (
        <div
          ref={refs.setFloating}
          id={context.floatingId}
          className={toolbarStyles.popup}
          style={floatingStyles}
          role="dialog"
          aria-labelledby={referenceId}
          {...getFloatingProps()}
        >
          <ul className={styles.list}>
            {interactions.map(({ shortcut, description }) => (
              <li key={shortcut} className={styles.entry}>
                <span>{description}</span>{' '}
                <kbd className={styles.shortcut}>{shortcut}</kbd>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default InteractionHelp;
