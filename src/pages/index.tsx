import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Prismic from '@prismicio/client';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';
import { dateFormatter } from '../utils/formaters';

import ExitPreview from '../components/ExitPreview';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps): JSX.Element {
  const { next_page, results } = postsPagination;

  const [posts, setPosts] = useState(() => results);
  const [nextPage, setNextPage] = useState(() => next_page);

  const loadMorePosts = async (): Promise<void> => {
    try {
      const response = await fetch(nextPage);
      const postsResponse = (await response.json()) as ApiSearchResponse;

      const newPosts = postsResponse.results.map(post => ({
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      }));

      setPosts(prevState => [...prevState, ...newPosts]);
      setNextPage(postsResponse.next_page);
    } catch (error) {
      //
    }
  };

  return (
    <>
      <Head>
        <title>spacetraveling | Home</title>
      </Head>

      <div className={`${commonStyles.container} ${styles.homeContainer}`}>
        <header>
          <Image src="/logo.svg" alt="logo" width={239} height={26} />
        </header>

        <main className={styles.homeMainContent}>
          <ul>
            {posts.map(post => (
              <li key={post.uid} className={styles.postItem}>
                <Link href={`/post/${post.uid}`}>
                  <a>
                    <h2>{post.data.title}</h2>
                    <p>{post.data.subtitle}</p>

                    <div>
                      <p>
                        <FiCalendar size={20} />
                        <time>
                          {dateFormatter(post.first_publication_date)}
                        </time>
                      </p>
                      <p>
                        <FiUser size={20} />
                        <span>{post.data.author}</span>
                      </p>
                    </div>
                  </a>
                </Link>
              </li>
            ))}
          </ul>

          {nextPage && (
            <button
              type="button"
              onClick={loadMorePosts}
              className={styles.loadMorePostsButton}
            >
              Carregar mais posts
            </button>
          )}
        </main>

        {preview && <ExitPreview />}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({ 
  previewData,
  preview = false
 }) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 5,
      ref: previewData?.ref ?? null,
    }
  );

  const posts = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
      preview,
    },
  };
};
