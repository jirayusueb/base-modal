import { type FC, type ReactNode, useEffect, useRef } from "react";

interface TestModalProps {
  visible?: boolean;
  onExited?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
  children?: ReactNode;
}

export const TestModal: FC<TestModalProps> = ({
  visible = false,
  onExited,
  onClose,
  onCancel,
  children,
}) => {
  const lastVisibleRef = useRef(visible);
  const lastVisible = lastVisibleRef.current;

  useEffect(() => {
    if (!visible && lastVisible && onExited) {
      setTimeout(onExited, 30);
    }
  }, [visible, onExited, lastVisible]);

  lastVisibleRef.current = visible;

  return (
    <div>
      TestModal {visible} <div>{children}</div>
      <p>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </p>
      <p>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </p>
    </div>
  );
};
