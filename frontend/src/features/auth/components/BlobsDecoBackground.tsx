/**
 * Blobs decorativos de fondo (purple + gold) para la pantalla de registro/login.
 * Posicionado absolute; el padre debe ser relative + overflow-hidden.
 */
export function BlobsDecoBackground() {
  return (
    <>
      <div className="absolute top-[6%] right-[4%] w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[8%] left-[4%] w-64 h-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
    </>
  );
}