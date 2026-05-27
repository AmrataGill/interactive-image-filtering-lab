export function KernelGrid({ kernel, setKernel }) {
  return (
    <div className="kernel-grid" aria-label="3 by 3 convolution kernel">
      {kernel.map((value, index) => (
        <input
          key={index}
          value={value}
          inputMode="decimal"
          aria-label={`Kernel value ${index + 1}`}
          onChange={(event) => {
            const next = [...kernel];
            next[index] = event.target.value;
            setKernel(next);
          }}
        />
      ))}
    </div>
  );
}
