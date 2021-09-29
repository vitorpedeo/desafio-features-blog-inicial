import Link from 'next/link';

import styles from './posts-navigation.module.scss';

interface Post {
  uid: string;
  title: string;
}

interface PostsNavigationProps {
  previousPost: Post;
  nextPost: Post;
}

export default function PostsNavigation({ previousPost, nextPost }: PostsNavigationProps): JSX.Element {
  if (!previousPost && !nextPost) {
    return null;
  }

  return (
    <section className={styles.postsNavigationContainer}>
      {previousPost && (
        <Link href={`/post/${previousPost.uid}`}>
          <a>
            <p>{previousPost.title}</p>
            <span>Post anterior</span>
          </a>
        </Link>
      )}
      {nextPost && (
        <Link href={`/post/${nextPost.uid}`}>
          <a>
            <p>{nextPost.title}</p>
            <span>Próximo post</span>
          </a>
        </Link>
      )}
    </section>
  );
};