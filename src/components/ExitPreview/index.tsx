import Link from 'next/link';

import styles from './exit-preview.module.scss';

export default function ExitPreview() {
  return (
    <Link href="/api/exit-preview">
      <a className={styles.exitLink}>
        Sair do Modo Preview
      </a>
    </Link>
  );
};