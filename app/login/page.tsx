'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type LoginForm = {
  nome: string;
  senha: string;
};

type LoginErros = Partial<Record<keyof LoginForm, string>>;

const INITIAL_FORM: LoginForm = {
  nome: '',
  senha: '',
};

const validateLoginForm = (form: LoginForm): LoginErros => {
  const erros: LoginErros = {};

  if (!form.nome.trim()) {
    erros.nome = 'Informe seu nome de usuário.';
  }

  if (!form.senha.trim()) {
    erros.senha = 'Informe sua senha.';
  }

  return erros;
};

const simularLogin = async (payload: LoginForm) => {
  // TODO: substituir por autenticação real com API/MongoDB.
  console.log('Login simulado:', payload);
  await new Promise((resolve) => setTimeout(resolve, 700));
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>(INITIAL_FORM);
  const [erros, setErros] = useState<LoginErros>({});
  const [enviando, setEnviando] = useState(false);

  const isFormValido = useMemo(
    () => form.nome.trim() && form.senha.trim(),
    [form]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const novosErros = validateLoginForm(form);
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      return;
    }

    try {
      setEnviando(true);
      await simularLogin(form);
      router.push('/');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className={styles.page} aria-label="Página de login">
      <div className={styles.card}>
        <h1 className={styles.title}>Entrar</h1>
        <p className={styles.subtitle}>
          Acesse sua conta para continuar na plataforma.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="nome">Nome de usuário</label>
            <input
              id="nome"
              type="text"
              value={form.nome}
              onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
              aria-invalid={Boolean(erros.nome)}
              placeholder="Digite seu nome de usuário"
            />
            {erros.nome && <span className={styles.error}>{erros.nome}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={form.senha}
              onChange={(e) => setForm((prev) => ({ ...prev, senha: e.target.value }))}
              aria-invalid={Boolean(erros.senha)}
              placeholder="Digite sua senha"
            />
            {erros.senha && <span className={styles.error}>{erros.senha}</span>}
          </div>

          <button
            className={styles.submit}
            type="submit"
            disabled={enviando || !isFormValido}
          >
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className={styles.signupHint}>
          Não tem conta?{' '}
          <Link href="/auth/cadastro" className={styles.signupLink}>
            Cadastre-se
          </Link>
        </p>
      </div>
    </section>
  );
}
