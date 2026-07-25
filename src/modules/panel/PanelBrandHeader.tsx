import Image from "next/image";

export function PanelBrandHeader({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src="/Logo_principal_oscuro_luck.svg"
        alt="Luck"
        width={505}
        height={257}
        className="h-6 w-auto"
      />
    </div>
  );
}
