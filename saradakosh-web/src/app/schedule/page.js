import ClassSchedule from '@/components/ClassSchedule';

export const metadata = {
  title: 'Class Schedule | Saradakosh',
};

export default function SchedulePage() {
  return (
    <main className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <ClassSchedule hideImage={false} />
    </main>
  );
}
