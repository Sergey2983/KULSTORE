type IconProps = { size?: number; className?: string };

export function TelegramIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  );
}

export function MaxIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 18V6l5 7 5-7v12" />
    </svg>
  );
}

export function VkIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.9 16.3c-5.36 0-8.66-3.74-8.8-9.96h2.7c.1 4.57 2.07 6.46 3.62 6.85V6.34h2.55v3.86c1.55-.17 3.18-1.92 3.73-3.86h2.54c-.42 2.4-2.16 4.15-3.4 4.87 1.24.59 3.22 2.12 3.97 5.09h-2.8c-.59-1.84-2.08-3.27-4.04-3.46v3.46h-.34z" />
    </svg>
  );
}

const LINKS = [
  { label: "Telegram", href: "https://t.me/kulstore", Icon: TelegramIcon },
  { label: "MAX", href: "https://max.ru/kulstore", Icon: MaxIcon },
  { label: "VK", href: "https://vk.com/kulstore", Icon: VkIcon },
];

export function SocialLinks({
  size = 16,
  className = "",
  linkClassName = "",
}: {
  size?: number;
  className?: string;
  linkClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {LINKS.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          <Icon size={size} />
        </a>
      ))}
    </div>
  );
}
