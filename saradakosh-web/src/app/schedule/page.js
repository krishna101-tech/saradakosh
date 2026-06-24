import ClassSchedule from '@/components/ClassSchedule';

export const metadata = {
  title: 'Class Schedule | Saradakosh',
};

export default function SchedulePage() {
  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <ClassSchedule hideImage={false} />
    </div>
  );
}
