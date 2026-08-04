// Marca em grade de pontos — elemento gráfico recorrente no material da
// marca (aparece como selo repetido nos slides). Recriada em CSS puro.
export default function DotGridLogo({ size = 4, gap = 3 }: { size?: number; gap?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(3, ${size}px)`,
        gap,
      }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: 'var(--color-green-forte)',
          }}
        />
      ))}
    </div>
  );
}
