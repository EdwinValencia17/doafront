import React, { useRef } from "react";
import { StyleClass } from "primereact/styleclass";

/**
 * Wrapper para usar PrimeReact StyleClass sin peleas de tipos.
 * - Mantiene un ref interno HTMLElement
 * - Inyecta ese ref al child via cloneElement
 * - Pasa nodeRef a StyleClass con la forma que exige su .d.ts
 */
type StyleToggleProps = {
  /** Trigger: un único elemento (div, a, button, etc.) */
  children: React.ReactElement<unknown>;
  selector?: "@next" | "@prev" | "@parent" | "@grandparent" | string;
  enterFromClassName?: string;
  enterActiveClassName?: string;
  enterToClassName?: string;
  leaveFromClassName?: string;
  leaveActiveClassName?: string;
  leaveToClassName?: string;
  hideOnOutsideClick?: boolean;
  toggleClassName?: string;
};

/** Merge seguro de refs (sin any) */
function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(value);
      } else {
        try {
          (ref as React.MutableRefObject<T>).current = value;
        } catch {
          // no-op
        }
      }
    }
  };
}

/** Permite a TS que podamos insertar un ref en el elemento clonado sin usar `any`. */
type ElementWithOptionalRef<P = unknown> = React.ReactElement<P> & { ref?: React.Ref<unknown> };

export const StyleToggle = React.forwardRef<HTMLElement, StyleToggleProps>(
  (
    {
      children,
      selector = "@next",
      enterFromClassName,
      enterActiveClassName,
      enterToClassName,
      leaveFromClassName,
      leaveActiveClassName,
      leaveToClassName,
      hideOnOutsideClick,
      toggleClassName,
    },
     // no exponemos ref externo
  ) => {
    // Ref del trigger (siempre HTMLElement para evitar invarianza)
    const triggerRef = useRef<HTMLElement>(null!);

    // Preservar ref original del hijo (si lo tuviera)
    const childWithMaybeRef = children as ElementWithOptionalRef;
    const originalRef = childWithMaybeRef.ref;

    const composedRef = mergeRefs<unknown>(
      originalRef as React.Ref<unknown> | undefined,
      (el) => {
        // durante unmount, el puede ser null
        triggerRef.current = (el ?? null) as unknown as HTMLElement;
      }
    );

    // Clon seguro: TS sabe que este ReactElement acepta Attributes, incluído `ref`
    const cloned = React.cloneElement(childWithMaybeRef, {
      ref: composedRef as React.Ref<unknown>,
    });

    return (
      <StyleClass
        // La d.ts de PrimeReact exige MutableRefObject<ReactNode> (sí, raro).
        // Casteamos el HTMLElement ref a esa forma usando `unknown` (no `any`).
        nodeRef={triggerRef as unknown as React.MutableRefObject<React.ReactNode>}
        selector={selector}
        enterFromClassName={enterFromClassName}
        enterActiveClassName={enterActiveClassName}
        enterToClassName={enterToClassName}
        leaveFromClassName={leaveFromClassName}
        leaveActiveClassName={leaveActiveClassName}
        leaveToClassName={leaveToClassName}
        hideOnOutsideClick={hideOnOutsideClick}
        toggleClassName={toggleClassName}
      >
        {cloned}
      </StyleClass>
    );
  }
);

StyleToggle.displayName = "StyleToggle";
