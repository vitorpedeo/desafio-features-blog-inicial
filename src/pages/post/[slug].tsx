import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { Fragment } from 'react';
import { getPrismicClient } from '../../services/prismic';
import { dateFormatter } from '../../utils/formaters';

import Header from '../../components/Header';
import Comments from '../../components/Comments';
import ExitPreview from '../../components/ExitPreview';
import PostsNavigation from '../../components/PostsNavigation';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PreviousOrNextPost {
  uid: string;
  title: string;
}

interface PostProps {
  post: Post;
  previousPost: PreviousOrNextPost;
  nextPost: PreviousOrNextPost;
  preview: boolean;
}

export default function Post({
  post,
  previousPost,
  nextPost,
  preview,
}: PostProps): JSX.Element {
  const { isFallback } = useRouter();

  const wordsPerMinute = 200;
  const wordsCount = post.data.content.reduce((totalWords, currentContent) => {
    const totalHeadingWords = currentContent.heading.split(' ').length;
    const totalBodyWords = RichText.asText(currentContent.body).split(
      ' ',
    ).length;
    const totalContentWords = totalHeadingWords + totalBodyWords;

    return totalWords + totalContentWords;
  }, 0);
  const timeToReadPost = Math.ceil(wordsCount / wordsPerMinute);
  const formattedPublicationDate = dateFormatter(post.first_publication_date);
  const formattedEditionDate = dateFormatter(
    post.last_publication_date,
    "dd MMM yyyy, 'às' HH:mm",
  );

  if (isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Head>
        <title>spacetraveling | {post.data.title}</title>
      </Head>

      <Header />

      <section className={styles.imageSection}>
        <Image src={post.data.banner.url} layout="fill" objectFit="cover" />
      </section>

      <main className={`${commonStyles.container} ${styles.main}`}>
        <h1>{post.data.title}</h1>

        <div>
          <p>
            <FiCalendar size={20} />
            <time>{formattedPublicationDate}</time>
          </p>
          <p>
            <FiUser size={20} />
            <span>{post.data.author}</span>
          </p>
          <p>
            <FiClock size={20} />
            <span>{timeToReadPost} min</span>
          </p>
        </div>

        <p>
          <i>* editado em {formattedEditionDate}</i>
        </p>

        <section className={styles.contentSection}>
          {post.data.content.map(item => (
            <Fragment key={item.heading}>
              <h2>{item.heading}</h2>
              <div
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(item.body) }}
              />
            </Fragment>
          ))}
        </section>

        <PostsNavigation previousPost={previousPost} nextPost={nextPost} />

        <Comments />

        {preview && <ExitPreview />}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 100,
    },
  );

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const currentResponse = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const post = {
    uid: currentResponse.uid,
    first_publication_date: currentResponse.first_publication_date,
    last_publication_date: currentResponse.last_publication_date,
    data: {
      title: currentResponse.data.title,
      subtitle: currentResponse.data.subtitle,
      banner: {
        url: currentResponse.data.banner.url,
      },
      author: currentResponse.data.author,
      content: currentResponse.data.content,
    },
  };

  // Fetching previous and next post
  const nextResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: currentResponse?.id,
      orderings: '[document.first_publication_date]',
    },
  );
  const previousResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: currentResponse?.id,
      orderings: '[document.first_publication_date desc]',
    },
  );

  const nextPost = nextResponse.results[0]
    ? {
        uid: nextResponse.results[0].uid,
        title: nextResponse.results[0].data?.title,
      }
    : null;
  const previousPost = previousResponse.results[0]
    ? {
        uid: previousResponse.results[0].uid,
        title: previousResponse.results[0].data?.title,
      }
    : null;

  return {
    props: {
      post,
      previousPost,
      nextPost,
      preview,
    },
  };
};
