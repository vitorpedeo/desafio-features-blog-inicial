import { NextApiRequest, NextApiResponse } from 'next';
import { Document } from '@prismicio/client/types/documents';

import { getPrismicClient } from '../../services/prismic';

type RequestQuery = {
  token: string;
  documentId: string;
};

function linkResolver(document: Document): string {
  if (document.type === 'posts') {
    return `/post/${document.uid}`;
  }

  return '/';
}

export default async (request: NextApiRequest, response: NextApiResponse) => {
  const { token: ref, documentId } = request.query as RequestQuery;
  const redirectUrl = await getPrismicClient(request)
    .getPreviewResolver(ref, documentId)
    .resolve(linkResolver, '/');

  if (!redirectUrl) {
    return response.status(401).json({ message: 'Invalid token' });
  }

  response.setPreviewData({ ref });

  response.write(
    `
    <!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${redirectUrl}" />
    <script>window.location.href = '${redirectUrl}'</script>
    </head>
    `,
  );
  response.end();
};
