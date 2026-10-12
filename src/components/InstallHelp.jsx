import { Smartphone } from 'lucide-react';

export default function InstallHelp() {
  return (
    <div className="install-help">
      <Smartphone size={18} />
      <div>
        <strong>Как установить приложение</strong>
        <p>Android: меню браузера → «Установить приложение». iPhone: Safari → «Поделиться» → «На экран Домой».</p>
      </div>
    </div>
  );
}
