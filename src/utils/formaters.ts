import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dateFormatter = (rawDate: string): string => {
  const parsedDate = parseISO(rawDate);
  
  if (!isValid(parsedDate)) {
    return '-';
  }

  return format(parsedDate, 'dd MMM yyyy', { locale: ptBR });
};
