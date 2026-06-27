import ClassSchedule from '@/components/ClassSchedule';

export const metadata = {
  title: 'Class Schedule | Saradakosh',
  description: 'View the morning class schedule and registration link.',
  alternates: {
    canonical: 'https://saradakosh.org/schedule'
  }
};

export default function SchedulePage() {
  return (
    <main className="max-w-[1000px] mx-auto p-5 pt-10 pb-15">
      <ClassSchedule hideImage={false} />
    </main>
  );
}
