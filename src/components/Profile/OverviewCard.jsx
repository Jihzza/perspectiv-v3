// src/components/Profile/OverviewCard.jsx
export default function OverviewCard({ posts = "—", followers = "—", following = "—" }) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Overview</h3>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-2xl font-bold">{posts}</div>
            <div className="text-sm text-white/70">Posts</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{followers}</div>
            <div className="text-sm text-white/70">Followers</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{following}</div>
            <div className="text-sm text-white/70">Following</div>
          </div>
        </div>
      </div>
    );
  }