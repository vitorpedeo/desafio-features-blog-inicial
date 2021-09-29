import { NextApiResponse } from 'next';

export default async (_, response: NextApiResponse) => {
  response.clearPreviewData();

  response.writeHead(307, { location: '/' });
  response.end();
};
