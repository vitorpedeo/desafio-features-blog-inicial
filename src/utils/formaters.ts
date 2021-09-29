import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dateFormatter = (
  rawDate: string, 
  dateFormat = 'dd MMM yyyy'
): string => {
  const parsedDate = parseISO(rawDate);
  
  if (!isValid(parsedDate)) {
    return '-';
  }

  return format(parsedDate, dateFormat, { locale: ptBR });
};
