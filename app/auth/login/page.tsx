'use client';

import { useMemo, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type LoginForm = {
  email: string;
  senha: string;
};

type LoginErros = Partial<Record<keyof LoginForm, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM: LoginForm = {
  email: '',
  senha: '',
};

const validateLoginForm = (form: LoginForm): LoginErros => {
  const erros: LoginErros = {};

  if (!form.email.trim()) {
    erros.email = 'Informe seu e-mail.';
  } else if (!EMAIL_REGEX.test(form.email)) {
    erros.email = 'Informe um e-mail válido.';
  }

  if (!form.senha.trim()) {
    erros.senha = 'Informe sua senha.';
  }

  return erros;
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>(INITIAL_FORM);
  const [erros, setErros] = useState<LoginErros>({});
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  const isFormValido = useMemo(
    () => form.email.trim() && form.senha.trim(),
    [form]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensagemErro('');
    setMensagemSucesso('');

    const novosErros = validateLoginForm(form);
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      return;
    }

    try {
      setEnviando(true);
      const result = await signIn('credentials', {
        email: form.email.trim(),
        senha: form.senha,
        redirect: false,
      });

      if (result?.error) {
        setMensagemErro(result.error || 'Não foi possível autenticar.');
        return;
      }

      setMensagemSucesso('Login realizado com sucesso.');
      router.push('/');
    } catch (error) {
      console.error('Erro ao autenticar:', error);
      setMensagemErro('Não foi possível conectar ao servidor. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section aria-label="Página de login">
      <h1>Entrar</h1>
      <p>Use seu e-mail e senha para acessar sua conta.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            aria-invalid={Boolean(erros.email)}
            placeholder="Digite seu e-mail"
          />
          {erros.email && <span role="alert">{erros.email}</span>}
        </div>

        <div>
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={form.senha}
            onChange={(event) => setForm((prev) => ({ ...prev, senha: event.target.value }))}
            aria-invalid={Boolean(erros.senha)}
            placeholder="Digite sua senha"
          />
          {erros.senha && <span role="alert">{erros.senha}</span>}
        </div>

        <button type="submit" disabled={enviando || !isFormValido}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {mensagemErro && <p role="alert">{mensagemErro}</p>}
      {mensagemSucesso && <p role="status">{mensagemSucesso}</p>}
    </section>
  );
}
