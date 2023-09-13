import { getServerSession } from 'next-auth/next'
import { authOptions } from 'lib/nextauth'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Participant } from '@prisma/client'
import { GetServerSidePropsContext } from 'next'

export default function NewParticipantPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<Participant>()
  const onSubmit: SubmitHandler<Participant> = async (payload) => {
    const update = await fetch(`/api/admin/participants`, {
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
      new Participant page
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Name</label>
          <input type="text" {...register('name', { required: true })} />
          <button type="submit">Create Participant</button>
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
    props: {}
  }
}
