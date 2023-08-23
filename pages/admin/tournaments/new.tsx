import { getServerSession } from 'next-auth/next'
import { authOptions } from 'lib/nextauth'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Tournament } from '@prisma/client'
import { GetServerSidePropsContext } from 'next'

export default function NewTournamentPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<Tournament>()
  const onSubmit: SubmitHandler<Tournament> = async (payload) => {
    const update = await fetch(`/api/admin/tournaments`, {
      method: 'POST',
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
    console.log('success and redirect', data)
  }
  
  if (Object.keys(errors).length > 0) {
    console.info(errors)
  }

  return (
    <div>
      new tournament page
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Name</label>
          <input type="text" {...register('name', { required: true })} />
          <label>Short Key</label>
          <input type="text" pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$" {...register('shortKey', { required: true })} />
          <label>Active</label>
          <input type="checkbox" {...register('active')} />
          <hr />
          <button type="submit">Create Tournament</button>
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

  return {
    props: null
  }
}
