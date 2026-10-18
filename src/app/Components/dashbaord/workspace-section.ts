import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-workspace-section',
  templateUrl: './workspace-section.html',
  styleUrl: './workspace-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceSection {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
