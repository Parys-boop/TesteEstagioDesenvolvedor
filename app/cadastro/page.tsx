'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

type CadastroForm = {
  nome: string;
  email: string;
  senha: string;
};

type CadastroErros = Partial<Record<keyof CadastroForm, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM: CadastroForm = {
  nome: '',
  email: '',
  senha: '',
};

const validateCadastroForm = (form: CadastroForm): CadastroErros => {
  const erros: CadastroErros = {};

  if (!form.nome.trim()) {
    erros.nome = 'Informe seu nome de usuário.';
  }

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

const simularCadastro = async (payload: CadastroForm) => {
  // TODO: substituir por integração real com API/MongoDB.
  console.log('Cadastro simulado:', payload);
  await new Promise((resolve) => setTimeout(resolve, 700));
};

export default function CadastroPage() {
  const [form, setForm] = useState<CadastroForm>(INITIAL_FORM);
  const [erros, setErros] = useState<CadastroErros>({});
  const [enviando, setEnviando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const isFormValido = useMemo(
    () => form.nome.trim() && form.email.trim() && form.senha.trim(),
    [form]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensagemSucesso('');

    const novosErros = validateCadastroForm(form);
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      return;
    }

    try {
      setEnviando(true);
      await simularCadastro(form);
      setMensagemSucesso('Cadastro simulado com sucesso. Em breve teremos integração com banco de dados.');
      setForm(INITIAL_FORM);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className={styles.page} aria-label="Página de cadastro">
      <div className={styles.card}>
        <h1 className={styles.title}>Criar conta</h1>
        <p className={styles.subtitle}>
          Cadastre-se para continuar usando a plataforma.
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
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              aria-invalid={Boolean(erros.email)}
              placeholder="Digite seu e-mail"
            />
            {erros.email && <span className={styles.error}>{erros.email}</span>}
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
            {enviando ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        {mensagemSucesso && (
          <p className={styles.success} role="status">
            {mensagemSucesso}
          </p>
        )}

        <p className={styles.loginHint}>
          Já tem conta?{' '}
          <Link href="/auth/login" className={styles.loginLink}>
            Entrar
          </Link>
        </p>
      </div>
    </section>
  );
}
