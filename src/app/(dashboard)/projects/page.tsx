import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, FolderOpen, ArrowRight } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { formatCurrency, getDaysUntilBilling } from '@/lib/calculations';
import type { Project } from '@/lib/types';

async function getProjects() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile for tier check
  const { data: profile } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('status', { ascending: true })
    .order('created_at', { ascending: false });

  return { projects: projects || [], tier: profile?.subscription_tier || 'free' };
}

export default async function ProjectsPage() {
  const { projects, tier } = await getProjects();

  const activeProjects = projects.filter((p: Project) => p.status === 'active');
  const otherProjects = projects.filter((p: Project) => p.status !== 'active');

  // Free tier limit check
  const canCreateProject =
    tier !== 'free' || activeProjects.length < 2;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage your construction projects and pay applications.
          </p>
        </div>
        {canCreateProject ? (
          <Link href="/projects/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>New Project</Button>
          </Link>
        ) : (
          <Link href="/settings">
            <Button variant="secondary" leftIcon={<Plus className="h-4 w-4" />}>
              Upgrade to Add More Projects
            </Button>
          </Link>
        )}
      </div>

      {/* Free tier notice */}
      {tier === 'free' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-800">
              Free Plan: {activeProjects.length}/2 active projects
            </p>
            <p className="text-sm text-amber-700">
              Upgrade to Pro for unlimited projects and no watermarks.
            </p>
          </div>
          <Link href="/settings">
            <Button size="sm" variant="secondary">
              Upgrade
            </Button>
          </Link>
        </div>
      )}

      {/* Active Projects */}
      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">
          Active Projects ({activeProjects.length})
        </h2>

        {activeProjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-navy-900 mb-2">
                No active projects
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first project to start generating pay applications.
              </p>
              {canCreateProject && (
                <Link href="/projects/new">
                  <Button leftIcon={<Plus className="h-4 w-4" />}>
                    Create Your First Project
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Completed/Archived Projects */}
      {otherProjects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-navy-900 mb-4">
            Completed & Archived ({otherProjects.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherProjects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const daysUntilBilling = getDaysUntilBilling(project.billing_day);

  const statusVariant = {
    active: 'success' as const,
    completed: 'info' as const,
    archived: 'default' as const,
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <Card hover className="h-full">
        <CardContent className="py-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-navy-900">
                {project.project_name}
              </h3>
              {project.project_number && (
                <p className="text-xs text-gray-500">#{project.project_number}</p>
              )}
            </div>
            <Badge variant={statusVariant[project.status]}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>

          <p className="text-sm text-gray-600 mb-3">{project.gc_name}</p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Contract Sum</span>
              <span className="font-medium font-mono">
                {formatCurrency(project.original_contract_sum)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Retainage</span>
              <span className="font-medium">
                {(project.retainage_rate_work * 100).toFixed(0)}%
              </span>
            </div>
            {project.status === 'active' && (
              <div className="flex justify-between">
                <span className="text-gray-600">Next Billing</span>
                <span
                  className={`font-medium ${
                    daysUntilBilling <= 7 ? 'text-amber-600' : ''
                  }`}
                >
                  {daysUntilBilling} days
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-construction-500 font-medium flex items-center gap-1">
              View Project
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
