// Bloquea el scroll de la página mientras hay un modal o un panel abierto, para que la rueda del ratón
// solo mueva el modal. Si hay varios abiertos a la vez, la página se desbloquea cuando se cierra el último.

interface LockTarget {
  style: { overflow: string; paddingRight: string };
}

let activeLocks = 0;
let saved = { overflow: "", paddingRight: "" };

// scrollbarWidth: lo que ocupa la barra de scroll de la página. Al ocultarla, ese ancho se compensa con
// padding para que el contenido no "salte" hacia el costado.
export function lockScroll(target: LockTarget, scrollbarWidth: number): () => void {
  if (activeLocks === 0) {
    saved = { overflow: target.style.overflow, paddingRight: target.style.paddingRight };
    target.style.overflow = "hidden";
    if (scrollbarWidth > 0) target.style.paddingRight = `${scrollbarWidth}px`;
  }
  activeLocks += 1;

  let released = false;
  return () => {
    if (released) return; // liberar dos veces no debe romper la cuenta
    released = true;
    activeLocks -= 1;
    if (activeLocks === 0) {
      target.style.overflow = saved.overflow;
      target.style.paddingRight = saved.paddingRight;
    }
  };
}
