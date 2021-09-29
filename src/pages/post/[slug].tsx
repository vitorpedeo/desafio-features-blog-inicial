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

interface PostProps {
  post: Post;
  preview: boolean;
}

export default function Post({ post, preview }: PostProps): JSX.Element {
  const { isFallback } = useRouter();

  const wordsPerMinute = 200;
  const wordsCount = post.data.content.reduce((totalWords, currentContent) => {
    const totalHeadingWords = currentContent.heading.split(' ').length;
    const totalBodyWords = RichText.asText(currentContent.body).split(
      ' '
    ).length;
    const totalContentWords = totalHeadingWords + totalBodyWords;

    return totalWords + totalContentWords;
  }, 0);
  const timeToReadPost = Math.ceil(wordsCount / wordsPerMinute);
  const formattedPublicationDate = dateFormatter(post.first_publication_date);
  const formattedEditionDate = dateFormatter(post.last_publication_date, "dd MMM yyyy, 'às' HH:mm");

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
    }
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
  previewData 
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
      preview,
    },
  };
};
