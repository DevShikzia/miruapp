import { Component, ChangeDetectorRef } from '@angular/core'
import { Router } from '@angular/router'
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../services/api.service'
import { AuthService } from '../../services/auth.service'
import type { FamilyData, FamilyBalanceResponse, MemberContribution, ActivityItem } from '@shared/types/family.types'
import type { ICreateFamilyRequest, IJoinFamilyRequest } from '@shared/types/family.types'

@Component({
  selector: 'app-familia',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, DecimalPipe, DatePipe],
  template: `
    <div class="page"
      (touchstart)="onTouchStart($event)"
      (touchmove)="onTouchMove($event)"
      (touchend)="onTouchEnd()"
      (click)="closeMenus()"
    >
      <header class="header">
        <ng-container *ngIf="view === 'overview'">
          <button class="btn-back" (click)="goBack()">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F0F2F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 class="title">Familia</h1>
          <div class="header-right" *ngIf="state === 'active'">
            <div class="menu-wrap">
              <button class="btn-menu" (click)="showMenu = !showMenu; $event.stopPropagation()">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
              <div class="dropdown-menu" *ngIf="showMenu">
                <button class="dropdown-item" (click)="copyInviteCode(); $event.stopPropagation()">Copiar código de invitación</button>
                <button class="dropdown-item" (click)="goToMembers(); $event.stopPropagation()">Ver miembros</button>
                <button class="dropdown-item danger" (click)="confirmLeave(); $event.stopPropagation()">Salir del grupo</button>
              </div>
            </div>
          </div>
        </ng-container>
        <ng-container *ngIf="view === 'members'">
          <button class="btn-back" (click)="goToOverview()">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F0F2F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 class="title">Miembros</h1>
          <div class="header-right">
            <button class="btn-menu" (click)="copyInviteCode()">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E4B3E9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            </button>
          </div>
        </ng-container>
      </header>

      <!-- Loading -->
      <div class="loading-state" *ngIf="state === 'loading'">
        <div class="skeleton skel-card"></div>
        <div class="skeleton skel-row-item" *ngFor="let _ of [].constructor(3)"></div>
      </div>

      <!-- Error -->
      <div class="error-state" *ngIf="state === 'error'">
        <p class="error-text">No pudimos cargar la información del grupo</p>
        <button class="btn-retry" (click)="loadData()">Reintentar</button>
      </div>

      <!-- No group -->
      <div class="nogroup-state" *ngIf="state === 'nogroup'">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <h3 class="nogroup-title">Todavía no forms parte de un grupo familiar</h3>
        <p class="nogroup-sub">Creá un grupo e invitá a tu familia a usar Miru juntos.</p>

        <div class="nogroup-actions" *ngIf="!showCreateForm && !showJoinForm">
          <button class="btn-primary" (click)="showCreateForm = true">Crear grupo</button>
          <button class="btn-secondary" (click)="showJoinForm = true">Unirme a un grupo</button>
        </div>

        <!-- Create form -->
        <div class="inline-form" *ngIf="showCreateForm">
          <label class="form-label">Nombre del grupo</label>
          <div class="form-input-row">
            <input
              class="form-input"
              [(ngModel)]="createName"
              name="createName"
              type="text"
              placeholder="Ej: Familia García"
              maxlength="50"
              (keyup.enter)="createGroup()"
              autofocus
            />
          </div>
          <div class="form-actions">
            <button class="form-cancel" (click)="showCreateForm = false; createName = ''">Cancelar</button>
            <button class="form-confirm" [disabled]="!createName.trim() || creating" (click)="createGroup()">
              <span *ngIf="!creating">Crear</span>
              <span *ngIf="creating" class="btn-spinner">
                <img src="/assets/miru-icon.svg" class="spinner-miru" alt="" />
              </span>
            </button>
          </div>
          <p class="form-error" *ngIf="createError">{{ createError }}</p>
        </div>

        <!-- Join form -->
        <div class="inline-form" *ngIf="showJoinForm">
          <label class="form-label">Código de invitación</label>
          <div class="form-input-row">
            <input
              class="form-input code-input"
              [(ngModel)]="joinCode"
              name="joinCode"
              type="text"
              placeholder="Ej: aB3xK9mQ"
              maxlength="8"
              (keyup.enter)="joinGroup()"
              autofocus
            />
          </div>
          <div class="form-actions">
            <button class="form-cancel" (click)="showJoinForm = false; joinCode = ''">Cancelar</button>
            <button class="form-confirm" [disabled]="joinCode.length !== 8 || joining" (click)="joinGroup()">
              <span *ngIf="!joining">Unirme</span>
              <span *ngIf="joining" class="btn-spinner">
                <img src="/assets/miru-icon.svg" class="spinner-miru" alt="" />
              </span>
            </button>
          </div>
          <p class="form-error" *ngIf="joinError">{{ joinError }}</p>
        </div>
      </div>

      <!-- Active group -->
      <ng-container *ngIf="state === 'active' && family">
        <!-- Overview -->
        <ng-container *ngIf="view === 'overview'">
          <!-- Group card -->
          <div class="group-card">
            <div class="group-avatar">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E4B3E9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h2 class="group-name">{{ family.name }}</h2>
            <span class="group-members">{{ acceptedMembers.length }} miembro{{ acceptedMembers.length !== 1 ? 's' : '' }}</span>
            <span class="group-badge">Plan Familiar</span>

            <div class="invite-row" (click)="copyInviteCode()">
              <span class="invite-code">{{ family.inviteCode }}</span>
              <button class="invite-copy-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C99A0A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                Copiar
              </button>
            </div>
          </div>

          <!-- Member avatars -->
          <div class="avatar-row">
            <div
              class="avatar-circle"
              *ngFor="let m of acceptedMembers"
              [style.background]="m.avatarColor"
              [title]="m.name"
            >
              <span class="avatar-initials">{{ m.initials }}</span>
            </div>
            <button class="avatar-add" (click)="copyInviteCode()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
              Invitar
            </button>
          </div>

          <!-- Balance -->
          <section class="section" *ngIf="balance">
            <div class="section-header">
              <h3>Balance del grupo</h3>
            </div>
            <div class="balance-card">
              <div class="stat">
                <span class="stat-label">Total ingresado</span>
                <span class="stat-amount positive">$ {{ balance.balance.totalIncome | number:'1.0-0' }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Total gastado</span>
                <span class="stat-amount negative">$ {{ balance.balance.totalExpense | number:'1.0-0' }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Diferencia</span>
                <span class="stat-amount neutral">$ {{ balance.balance.netBalance | number:'1.0-0' }}</span>
              </div>
            </div>
          </section>

          <!-- Member contributions -->
          <section class="section" *ngIf="balance">
            <div class="section-header">
              <h3>Aportes del mes</h3>
            </div>
            <div class="contrib-list">
              <div class="contrib-item" *ngFor="let m of balance.members">
                <div class="contrib-avatar" [style.background]="m.avatarColor">
                  <span class="contrib-initials">{{ m.initials }}</span>
                </div>
                <div class="contrib-info">
                  <span class="contrib-name">{{ m.name }}</span>
                  <div class="contrib-amounts">
                    <span class="contrib-income">+$ {{ m.totalIncome | number:'1.0-0' }}</span>
                    <span class="contrib-expense">-$ {{ m.totalExpense | number:'1.0-0' }}</span>
                  </div>
                  <div class="contrib-bar-wrap">
                    <div class="contrib-bar-track">
                      <div class="contrib-bar-income" [style.width.%]="getIncomePct(m)"></div>
                      <div class="contrib-bar-expense" [style.width.%]="getExpensePct(m)"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Recent activity -->
          <section class="section" *ngIf="balance && balance.activity.length > 0">
            <div class="section-header">
              <h3>Actividad reciente</h3>
            </div>
            <div class="activity-list">
              <div class="activity-item" *ngFor="let a of balance.activity">
                <div class="activity-dot" [class]="'dot-' + a.type"></div>
                <div class="activity-content">
                  <span class="activity-line">
                    <strong>{{ a.userName }}</strong> {{ a.action }} {{ a.description }}
                  </span>
                  <span class="activity-time">{{ a.timestamp | date:'dd/MM HH:mm' }}</span>
                </div>
              </div>
            </div>
          </section>
        </ng-container>

        <!-- Members view -->
        <ng-container *ngIf="view === 'members'">
          <div class="member-count">{{ memberCount }} miembro{{ memberCount !== 1 ? 's' : '' }} · {{ adminCount }} administrador{{ adminCount !== 1 ? 'es' : '' }}</div>

          <div class="member-list">
            <div class="member-card" *ngFor="let m of membersWithStats">
              <div class="member-avatar" [style.background]="m.avatarColor">
                <span class="member-initials">{{ m.initials }}</span>
              </div>
              <div class="member-body">
                <div class="member-top">
                  <span class="member-name">{{ m.name }}</span>
                  <span class="member-role" [class.role-admin]="m.role === 'family_admin'" (click)="isAdmin && m.role !== 'family_admin' ? showRolePrompt(m.userId, m.name, m.role) : null">
                    {{ m.role === 'family_admin' ? 'Administrador' : 'Miembro' }}
                  </span>
                </div>
                <span class="member-joined">Miembro desde {{ m.joinedAt ? (m.joinedAt | date:'MMM yyyy') : '—' }}</span>
                <div class="member-stats">
                  <span class="member-income">+$ {{ m.totalIncome | number:'1.0-0' }}</span>
                  <span class="member-expense">-$ {{ m.totalExpense | number:'1.0-0' }}</span>
                </div>
              </div>
              <button class="member-remove" *ngIf="isAdmin && m.role !== 'family_admin'" (click)="showRemovePrompt(m.userId, m.name)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E05252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>

          <!-- Pending invitations -->
          <div class="pending-section" *ngIf="pendingInvitations.length > 0">
            <div class="pending-header">Invitaciones pendientes</div>
            <div class="pending-card" *ngFor="let inv of pendingInvitations">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C99A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div class="pending-info">
                <span class="pending-user">Invitación enviada</span>
                <span class="pending-date">Pendiente de aceptación</span>
              </div>
              <button class="pending-cancel" (click)="cancelInvite(inv.userId)">Cancelar</button>
            </div>
          </div>

          <!-- Admin actions -->
          <div class="admin-section" *ngIf="isAdmin">
            <button class="admin-btn danger" (click)="confirmLeave()">Salir del grupo</button>
          </div>
        </ng-container>
      </ng-container>

      <!-- Invite modal -->
      <div class="modal-overlay" *ngIf="showInviteModal" (click)="showInviteModal = false">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-handle"></div>
          <h3 class="modal-title">Invitá a tu familia</h3>
          <p class="modal-text">Compartí este código con quien quieras invitar:</p>
          <div class="code-display">{{ family?.inviteCode }}</div>
          <button class="btn-copy-code" (click)="copyInviteCode()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            {{ copied ? '¡Copiado!' : 'Copiar código' }}
          </button>
          <button class="modal-close-btn" (click)="showInviteModal = false">Cerrar</button>
        </div>
      </div>

      <!-- Role change modal -->
      <div class="modal-overlay" *ngIf="showRoleModal" (click)="showRoleModal = false">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-handle"></div>
          <h3 class="modal-title">Cambiar rol</h3>
          <p class="modal-text">¿Qué rol querés asignarle a <strong>{{ roleTargetName }}</strong>?</p>
          <div class="role-options">
            <button class="role-option" (click)="confirmRoleChange('member')">
              <span class="role-option-name">Miembro</span>
              <span class="role-option-desc">Puede ver y agregar gastos</span>
            </button>
            <button class="role-option" [class.role-active]="roleTargetCurrent === 'member'" (click)="confirmRoleChange('readonly')">
              <span class="role-option-name">Solo lectura</span>
              <span class="role-option-desc">Solo puede ver las finanzas</span>
            </button>
          </div>
          <button class="modal-close-btn" (click)="showRoleModal = false" style="margin-top:8px;">Cancelar</button>
        </div>
      </div>

      <!-- Remove member confirmation -->
      <div class="modal-overlay" *ngIf="showRemoveConfirm" (click)="showRemoveConfirm = false">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <h3 class="modal-title">¿Eliminar miembro?</h3>
          <p class="modal-text">Vas a eliminar a <strong>{{ removeTargetName }}</strong> del grupo. Esta acción no se puede deshacer.</p>
          <div class="modal-actions">
            <button class="modal-btn secondary" (click)="showRemoveConfirm = false">Cancelar</button>
            <button class="modal-btn danger" (click)="confirmRemoveMember()">
              <span *ngIf="!removingMember">Eliminar</span>
              <span *ngIf="removingMember" class="btn-spinner">
                <img src="/assets/miru-icon.svg" class="spinner-miru" alt="" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Leave confirmation -->
      <div class="modal-overlay" *ngIf="showLeaveConfirm" (click)="showLeaveConfirm = false">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <h3 class="modal-title">¿Salir del grupo?</h3>
          <p class="modal-text">Vas a perder acceso a las finanzas compartidas. Si querés volver, necesitás que alguien te invite de nuevo.</p>
          <div class="modal-actions">
            <button class="modal-btn secondary" (click)="showLeaveConfirm = false">Cancelar</button>
            <button class="modal-btn danger" (click)="leaveGroup()">
              <span *ngIf="!leaving">Salir</span>
              <span *ngIf="leaving" class="btn-spinner">
                <img src="/assets/miru-icon.svg" class="spinner-miru" alt="" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0C0F14; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    .page { padding: 56px 20px 80px; max-width: 390px; margin: 0 auto; }
    ::-webkit-scrollbar { display: none; }

    .header { display: flex; align-items: center; justify-content: space-between; }
    .btn-back { background: none; border: none; padding: 4px; cursor: pointer; display: flex; }
    .title { font-size: 20px; font-weight: 700; color: #F0F2F5; margin: 0; }
    .header-right { position: relative; }
    .btn-menu { background: none; border: none; padding: 4px; cursor: pointer; display: flex; }
    .menu-wrap { position: relative; }
    .dropdown-menu { position: absolute; top: 100%; right: 0; margin-top: 4px; background: #1E2530; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 4px; z-index: 10; min-width: 200px; box-shadow: 0 4px 16px rgba(0,0,0,0.4); }
    .dropdown-item { display: block; width: 100%; background: none; border: none; padding: 10px 14px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; text-align: left; cursor: pointer; border-radius: 8px; }
    .dropdown-item:hover { background: rgba(255,255,255,0.05); }
    .dropdown-item.danger { color: #E05252; }

    .loading-state { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
    .skeleton { background: #1E2530; border-radius: 24px; animation: shimmer 1.5s ease-in-out infinite; }
    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
    .skel-card { height: 160px; }
    .skel-row-item { height: 60px; border-radius: 16px; }

    .error-state { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 48px; }
    .error-text { color: #F87171; font-size: 14px; font-weight: 500; margin: 0; }
    .btn-retry { background: #1E2530; border: none; border-radius: 999px; padding: 10px 20px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }

    .nogroup-state { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 64px; text-align: center; }
    .nogroup-title { font-size: 16px; font-weight: 500; color: #8A95A8; margin: 0; }
    .nogroup-sub { font-size: 13px; font-weight: 400; color: #697586; margin: 0; max-width: 280px; line-height: 1.4; }
    .nogroup-actions { display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 260px; margin-top: 8px; }
    .btn-primary { height: 44px; background: #E4B3E9; color: #0C0F14; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; }
    .btn-secondary { height: 44px; background: transparent; color: #E4B3E9; border: 1.5px solid #E4B3E9; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; }

    .inline-form { width: 100%; max-width: 300px; margin-top: 16px; text-align: left; }
    .form-label { font-size: 12px; font-weight: 500; color: #8A95A8; display: block; margin-bottom: 6px; }
    .form-input-row { background: #1E2530; border-radius: 12px; height: 44px; display: flex; align-items: center; padding: 0 14px; }
    .form-input { flex: 1; background: transparent; border: none; outline: none; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 400; height: 100%; }
    .form-input::placeholder { color: #697586; }
    .code-input { text-transform: uppercase; letter-spacing: 3px; font-size: 16px; font-weight: 600; text-align: center; }
    .form-actions { display: flex; gap: 8px; margin-top: 10px; }
    .form-cancel, .form-confirm { flex: 1; height: 40px; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; border: none; cursor: pointer; }
    .form-cancel { background: #161B24; color: #8A95A8; }
    .form-confirm { background: #E4B3E9; color: #0C0F14; }
    .form-confirm:disabled { opacity: 0.4; cursor: not-allowed; }
    .form-error { color: #F87171; font-size: 12px; font-weight: 400; margin: 8px 0 0; text-align: center; }
    .btn-spinner { display: flex; align-items: center; justify-content: center; }
    .spinner-miru { width: 18px; height: 18px; animation: spin 800ms linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .group-card { margin-top: 16px; background: #161B24; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; }
    .group-avatar { width: 56px; height: 56px; border-radius: 50%; background: rgba(228,179,233,0.15); display: flex; align-items: center; justify-content: center; }
    .group-name { font-size: 22px; font-weight: 700; color: #F0F2F5; margin: 8px 0 0; }
    .group-members { font-size: 13px; font-weight: 400; color: #8A95A8; }
    .group-badge { font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 6px; background: rgba(228,179,233,0.15); color: #E4B3E9; margin-top: 6px; }
    .invite-row { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 8px 14px; background: #1E2530; border-radius: 12px; cursor: pointer; }
    .invite-code { font-size: 18px; font-weight: 700; color: #F0F2F5; letter-spacing: 4px; font-family: 'Courier New', monospace; }
    .invite-copy-btn { background: none; border: none; display: flex; align-items: center; gap: 4px; color: #C99A0A; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; padding: 4px; }

    .avatar-row { display: flex; align-items: center; gap: 0; margin-top: 16px; padding-left: 4px; flex-wrap: wrap; }
    .avatar-circle { width: 40px; height: 40px; border-radius: 999px; border: 2px solid #0C0F14; display: flex; align-items: center; justify-content: center; margin-left: -8px; flex-shrink: 0; }
    .avatar-circle:first-child { margin-left: 0; }
    .avatar-initials { font-size: 12px; font-weight: 700; color: #0C0F14; font-family: 'Inter', sans-serif; }
    .avatar-add { display: flex; align-items: center; gap: 6px; margin-left: 12px; padding: 6px 14px; background: #1E2530; border: 1px dashed rgba(255,255,255,0.1); border-radius: 999px; color: #8A95A8; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: flex-end; justify-content: center; z-index: 200; }
    .modal-card { width: 100%; max-width: 390px; background: #1E2530; border-radius: 24px 24px 0 0; padding: 16px 20px 32px; text-align: center; }
    .modal-handle { width: 36px; height: 4px; background: #697586; border-radius: 999px; margin: 0 auto 16px; }
    .modal-title { font-size: 18px; font-weight: 700; color: #F0F2F5; margin: 0 0 8px; }
    .modal-text { font-size: 13px; font-weight: 400; color: #8A95A8; margin: 0 0 16px; }
    .code-display { font-size: 28px; font-weight: 800; color: #F0F2F5; letter-spacing: 8px; font-family: 'Courier New', monospace; padding: 16px; background: #161B24; border-radius: 16px; margin-bottom: 16px; }
    .btn-copy-code { width: 100%; height: 44px; background: #C99A0A; color: #0C0F14; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .modal-close-btn { width: 100%; height: 40px; margin-top: 8px; background: #161B24; color: #8A95A8; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; }

    .modal-overlay:has(.modal-card:not(:empty)) { align-items: center; }
    .modal-card:not(:has(.modal-handle)) { border-radius: 24px; max-width: 320px; }
    .modal-actions { display: flex; gap: 8px; margin-top: 20px; }
    .modal-btn { flex: 1; height: 40px; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; border: none; cursor: pointer; }
    .modal-btn.secondary { background: #161B24; color: #F0F2F5; }
    .modal-btn.danger { background: #E05252; color: #F0F2F5; }

    .section { margin-top: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .section-header h3 { font-size: 16px; font-weight: 600; color: #F0F2F5; margin: 0; }

    .balance-card { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #161B24; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); overflow: hidden; }
    .stat { padding: 14px 8px; display: flex; flex-direction: column; align-items: center; gap: 4px; background: #161B24; }
    .stat + .stat { border-left: 1px solid rgba(255,255,255,0.04); }
    .stat-label { font-size: 11px; font-weight: 400; color: #8A95A8; }
    .stat-amount { font-size: 16px; font-weight: 700; }
    .stat-amount.positive { color: #15C48C; }
    .stat-amount.negative { color: #E05252; }
    .stat-amount.neutral { color: #F0F2F5; }

    .contrib-list { display: flex; flex-direction: column; background: #161B24; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); padding: 4px 16px; }
    .contrib-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .contrib-item:last-child { border: none; }
    .contrib-avatar { width: 32px; height: 32px; border-radius: 999px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .contrib-initials { font-size: 11px; font-weight: 700; color: #0C0F14; font-family: 'Inter', sans-serif; }
    .contrib-info { flex: 1; min-width: 0; }
    .contrib-name { font-size: 14px; font-weight: 500; color: #F0F2F5; display: block; }
    .contrib-amounts { display: flex; gap: 12px; margin-top: 2px; }
    .contrib-income { font-size: 13px; font-weight: 600; color: #15C48C; }
    .contrib-expense { font-size: 13px; font-weight: 600; color: #E05252; }
    .contrib-bar-wrap { margin-top: 6px; }
    .contrib-bar-track { height: 4px; background: #1E2530; border-radius: 999px; display: flex; overflow: hidden; }
    .contrib-bar-income { height: 100%; background: #15C48C; border-radius: 999px 0 0 999px; transition: width 0.5s ease; }
    .contrib-bar-expense { height: 100%; background: #E05252; border-radius: 0 999px 999px 0; transition: width 0.5s ease; }

    .activity-list { display: flex; flex-direction: column; background: #161B24; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); padding: 4px 16px; }
    .activity-item { display: flex; gap: 10px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .activity-item:last-child { border: none; }
    .activity-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
    .dot-income { background: #15C48C; }
    .dot-expense { background: #E05252; }
    .dot-debt { background: #C99A0A; }
    .dot-saving { background: #5B8DEF; }
    .activity-content { flex: 1; }
    .activity-line { font-size: 13px; font-weight: 400; color: #8A95A8; }
    .activity-line strong { color: #F0F2F5; font-weight: 500; }
    .activity-time { display: block; font-size: 11px; font-weight: 400; color: #697586; margin-top: 2px; }

    .member-count { margin-top: 8px; font-size: 12px; font-weight: 400; color: #697586; }
    .member-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
    .member-card { display: flex; align-items: center; gap: 12px; background: #161B24; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); padding: 16px; }
    .member-avatar { width: 40px; height: 40px; border-radius: 999px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .member-initials { font-size: 12px; font-weight: 700; color: #0C0F14; font-family: 'Inter', sans-serif; }
    .member-body { flex: 1; min-width: 0; }
    .member-top { display: flex; align-items: center; gap: 8px; }
    .member-name { font-size: 14px; font-weight: 600; color: #F0F2F5; }
    .member-role { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 6px; background: #1E2530; color: #8A95A8; cursor: default; white-space: nowrap; }
    .member-role.role-admin { background: rgba(228,179,233,0.15); color: #E4B3E9; }
    .member-joined { display: block; font-size: 11px; font-weight: 400; color: #697586; margin-top: 2px; }
    .member-stats { display: flex; gap: 16px; margin-top: 6px; }
    .member-income { font-size: 13px; font-weight: 600; color: #15C48C; }
    .member-expense { font-size: 13px; font-weight: 600; color: #E05252; }
    .member-remove { background: none; border: none; padding: 4px; cursor: pointer; display: flex; flex-shrink: 0; }

    .pending-section { margin-top: 24px; }
    .pending-header { font-size: 12px; font-weight: 500; color: #8A95A8; margin-bottom: 8px; }
    .pending-card { display: flex; align-items: center; gap: 10px; background: #1E2530; border-radius: 20px; border: 1px dashed rgba(255,255,255,0.08); padding: 14px 16px; }
    .pending-info { flex: 1; }
    .pending-user { display: block; font-size: 14px; font-weight: 500; color: #F0F2F5; }
    .pending-date { display: block; font-size: 12px; font-weight: 400; color: #697586; margin-top: 2px; }
    .pending-cancel { background: none; border: 1px solid rgba(224,82,82,0.3); border-radius: 999px; padding: 6px 14px; color: #E05252; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap; }

    .admin-section { margin-top: 24px; display: flex; flex-direction: column; gap: 8px; }
    .admin-btn { width: 100%; height: 44px; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; border: none; cursor: pointer; }
    .admin-btn.danger { background: rgba(224,82,82,0.15); color: #E05252; }

    .role-options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
    .role-option { display: flex; flex-direction: column; align-items: flex-start; padding: 14px 16px; background: #161B24; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; cursor: pointer; font-family: 'Inter', sans-serif; text-align: left; width: 100%; }
    .role-option-name { font-size: 14px; font-weight: 600; color: #F0F2F5; }
    .role-option-desc { font-size: 12px; font-weight: 400; color: #697586; margin-top: 2px; }
  `]
})
export class FamiliaComponent {
  state: 'loading' | 'active' | 'nogroup' | 'error' = 'loading'
  family: FamilyData | null = null
  balance: FamilyBalanceResponse | null = null
  view: 'overview' | 'members' = 'overview'
  showMenu = false
  showInviteModal = false
  showLeaveConfirm = false
  showRoleModal = false
  showRemoveConfirm = false
  copied = false
  creating = false
  joining = false
  leaving = false
  changingRole = false
  removingMember = false
  createError = ''
  joinError = ''
  showCreateForm = false
  showJoinForm = false
  createName = ''
  joinCode = ''
  roleTargetId: string | null = null
  roleTargetName = ''
  roleTargetCurrent = ''
  removeTargetId: string | null = null
  removeTargetName = ''

  pullDistance = 0
  private pullStartY = 0
  private pulling = false

  currentUserId = ''

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
  ) {
    const u = this.auth.user as { _id?: string } | null
    this.currentUserId = u?._id ?? ''
    this.loadData()
  }

  get acceptedMembers(): Array<{ userId: string; name: string; initials: string; avatarColor: string }> {
    if (!this.balance) return []
    return this.balance.members
  }

  get isAdmin(): boolean {
    if (!this.family || !this.currentUserId) return false
    return this.family.members.some(m => m.userId === this.currentUserId && m.role === 'family_admin')
  }

  get pendingInvitations(): Array<{ userId: string; role: string; invitedAt: string }> {
    if (!this.family) return []
    return this.family.members
      .filter(m => !m.acceptedAt)
      .map(m => ({ userId: m.userId, role: m.role, invitedAt: m.invitedAt }))
  }

  get memberCount(): number {
    return this.balance?.members.length ?? 0
  }

  get adminCount(): number {
    if (!this.family) return 0
    return this.family.members.filter(m => m.role === 'family_admin' && m.acceptedAt).length
  }

  get membersWithStats(): Array<{
    userId: string
    name: string
    initials: string
    avatarColor: string
    role: 'family_admin' | 'member' | 'readonly'
    joinedAt: string | null
    totalIncome: number
    totalExpense: number
  }> {
    if (!this.family || !this.balance) return []
    const roleMap = new Map(this.family.members.map(m => [m.userId, { role: m.role, acceptedAt: m.acceptedAt }]))
    return this.balance.members.map(c => {
      const info = roleMap.get(c.userId)
      return {
        ...c,
        role: info?.role ?? 'member',
        joinedAt: info?.acceptedAt ?? null,
      }
    })
  }

  closeMenus(): void {
    this.showMenu = false
  }

  loadData(): void {
    this.state = 'loading'
    this.api.get<FamilyData>('/family/my')
      .subscribe({
        next: (res) => {
          const f = res?.data
          if (f) {
            this.family = f
            this.loadBalance()
          } else {
            this.state = 'nogroup'
          }
        },
        error: (err) => {
          if (err.status === 404) {
            this.state = 'nogroup'
          } else {
            this.state = 'error'
          }
          this.cdr.detectChanges()
        },
      })
  }

  loadBalance(): void {
    this.api.get<FamilyBalanceResponse>('/family/balance')
      .subscribe({
        next: (res) => {
          this.balance = res?.data ?? null
          this.state = 'active'
          this.cdr.detectChanges()
        },
        error: () => {
          this.state = 'error'
          this.cdr.detectChanges()
        },
      })
  }

  goToMembers(): void {
    this.view = 'members'
    this.showMenu = false
  }

  goToOverview(): void {
    this.view = 'overview'
  }

  showRolePrompt(userId: string, name: string, currentRole: string): void {
    this.roleTargetId = userId
    this.roleTargetName = name
    this.roleTargetCurrent = currentRole
    this.showRoleModal = true
  }

  confirmRoleChange(newRole: string): void {
    if (!this.roleTargetId || this.changingRole) return
    this.changingRole = true
    this.api.patch(`/family/${this.family?._id}/members/${this.roleTargetId}`, { role: newRole })
      .subscribe({
        next: () => {
          this.changingRole = false
          this.showRoleModal = false
          this.roleTargetId = null
          this.loadData()
        },
        error: () => {
          this.changingRole = false
        },
      })
  }

  showRemovePrompt(userId: string, name: string): void {
    this.removeTargetId = userId
    this.removeTargetName = name
    this.showRemoveConfirm = true
  }

  confirmRemoveMember(): void {
    if (!this.removeTargetId || this.removingMember) return
    this.removingMember = true
    this.api.delete(`/family/${this.family?._id}/members/${this.removeTargetId}`)
      .subscribe({
        next: () => {
          this.removingMember = false
          this.showRemoveConfirm = false
          this.removeTargetId = null
          this.loadData()
        },
        error: () => {
          this.removingMember = false
        },
      })
  }

  resendInvite(userId: string): void {
  }

  cancelInvite(userId: string): void {
    if (!this.family) return
    this.api.delete(`/family/${this.family._id}/members/${userId}`)
      .subscribe({
        next: () => this.loadData(),
      })
  }

  goBack(): void {
    this.router.navigate(['/dashboard'])
  }

  createGroup(): void {
    const name = this.createName.trim()
    if (!name || this.creating) return
    this.creating = true
    this.createError = ''
    this.api.post<FamilyData>('/family', { name })
      .subscribe({
        next: (res) => {
          this.family = res?.data ?? null
          this.creating = false
          this.showCreateForm = false
          this.createName = ''
          if (this.family) this.loadBalance()
        },
        error: (err) => {
          this.creating = false
          this.createError = err?.error?.message || 'No pudimos crear el grupo'
          this.cdr.detectChanges()
        },
      })
  }

  joinGroup(): void {
    const code = this.joinCode.trim()
    if (code.length !== 8 || this.joining) return
    this.joining = true
    this.joinError = ''
    this.api.post<FamilyData>('/family/join', { inviteCode: code })
      .subscribe({
        next: (res) => {
          this.family = res?.data ?? null
          this.joining = false
          this.showJoinForm = false
          this.joinCode = ''
          if (this.family) this.loadBalance()
        },
        error: (err) => {
          this.joining = false
          this.joinError = err?.error?.message || 'Código inválido'
          this.cdr.detectChanges()
        },
      })
  }

  copyInviteCode(): void {
    const code = this.family?.inviteCode
    if (!code) return
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code)
    } else {
      const ta = document.createElement('textarea')
      ta.value = code
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    this.copied = true
    this.showInviteModal = true
    setTimeout(() => { this.copied = false }, 2000)
  }

  confirmLeave(): void {
    this.showMenu = false
    this.showLeaveConfirm = true
  }

  leaveGroup(): void {
    if (!this.family || this.leaving) return
    this.leaving = true
    this.api.delete('/family/' + this.family._id + '/members/' + '')
      .subscribe({
        next: () => {
          this.leaving = false
          this.showLeaveConfirm = false
          this.family = null
          this.balance = null
          this.state = 'nogroup'
          this.cdr.detectChanges()
        },
        error: () => {
          this.leaving = false
          this.cdr.detectChanges()
        },
      })
  }

  getIncomePct(m: MemberContribution): number {
    const max = Math.max(...this.balance?.members.map(x => x.totalIncome + x.totalExpense) || [1], 1)
    return (m.totalIncome / max) * 100
  }

  getExpensePct(m: MemberContribution): number {
    const max = Math.max(...this.balance?.members.map(x => x.totalIncome + x.totalExpense) || [1], 1)
    return (m.totalExpense / max) * 100
  }

  onTouchStart(event: TouchEvent): void {
    if (window.scrollY <= 0) {
      this.pullStartY = event.touches[0].clientY
      this.pulling = true
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.pulling) return
    const diff = event.touches[0].clientY - this.pullStartY
    if (diff > 0) this.pullDistance = Math.min(diff * 0.4, 120)
  }

  onTouchEnd(): void {
    if (this.pullDistance > 60) this.loadData()
    this.pullDistance = 0
    this.pulling = false
  }
}
