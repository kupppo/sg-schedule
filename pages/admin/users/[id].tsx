import { getServerSession } from 'next-auth/next'
import { authOptions } from 'lib/nextauth'
import { SubmitHandler, useForm } from 'react-hook-form'
import { User } from '@prisma/client'
import prisma from 'lib/prisma'
import SuperJSON from 'superjson'
import { GetServerSidePropsContext } from 'next'

export default function EditUserPage({ name, role, id }: User) {
  const { register, handleSubmit, formState: { errors } } = useForm<User>({
    defaultValues: {
      name,
      role,
    }
  })
  const onSubmit: SubmitHandler<User> = async (payload) => {
    if (!!payload.role) {
      payload.role = null
    }
    const update = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    if (!update.ok) {
      console.error('error update')
      return
    }
    const data = await update.json()
    console.log('success', data)
  }
  
  if (Object.keys(errors).length > 0) {
    console.info(errors)
  }

  return (
    <div>
      User page
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Name</label>
          <input disabled type="text" {...register('name')} />
          <label>Role</label>
          <select {...register('role')}>
            <option value="">&mdash;</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <hr />
          <button type="submit">Save User</button>
        </form>        
      </div>
    </div>
  )
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  const allowedRoles = ['admin', 'editor']
  if (!session) {
    return {
      redirect: {
        destination: '/login?callbackUrl=/admin',
        permanent: false,
      }
    }
  }

  // @ts-ignore
  const role = session?.user?.role
  if (!role) {
    // show denied
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }
  const notAllowed = !allowedRoles.includes(role)
  if (notAllowed) {
    // show denied
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  const id = context?.params?.id as string
  const entry = await prisma.user.findUnique({
    where: {
      id,
    }
  })
  if (!entry) {
    return { notFound: true }
  }
  const { json: user } = SuperJSON.serialize(entry)
  return {
    props: user
  }
}