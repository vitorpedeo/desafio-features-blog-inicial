import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dateFormatter = (rawDate: string): string => {
  const parsedDate = parseISO(rawDate);

  return format(parsedDate, 'dd MMM yyyy', { locale: ptBR });
};
