import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

type ConfirmActionOptions = {
  message: string;
  header?: string;
  acceptLabel?: string;
  rejectLabel?: string;
};

export const useAppNotify = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const showError = (message: string) => {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: message,
      life: 5000,
    });
  };

  const showSuccess = (message: string) => {
    toast.add({
      severity: 'success',
      detail: message,
      life: 4000,
    });
  };

  const confirmAction = ({
    message,
    header = 'Подтверждение',
    acceptLabel = 'Да',
    rejectLabel = 'Нет',
  }: ConfirmActionOptions) => {
    return new Promise<boolean>((resolve) => {
      confirm.require({
        message,
        header,
        acceptLabel,
        rejectLabel,
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  };

  return {
    showError,
    showSuccess,
    confirmAction,
  };
};
