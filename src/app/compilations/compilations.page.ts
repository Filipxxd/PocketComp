import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../_services/storage.service';
import { Compilation } from '../_models/compilation';
import { SAVED_COMPILATIONS } from '../app.constants';
import { Language, LanguageDisplayNames } from '../_models/languages';

@Component({
  selector: 'compilations',
  templateUrl: 'compilations.page.html',
  styleUrls: ['compilations.page.scss'],
  standalone: false
})
export class CompilationsPage implements OnInit {
  public languageDisplayNames = LanguageDisplayNames;
  compilations: Compilation[] | null = null;
  filteredCompilations: Compilation[] | null = null;
  searchTerm: string = '';
  selectedLanguage: Language | null = null;
  languages = [null, ...Object.values(Language)];

  constructor(
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.compilations = await this.storageService.get(SAVED_COMPILATIONS);
    if (this.compilations) {
      this.compilations.sort((a: Compilation, b: Compilation) => b.timestamp.getTime() - a.timestamp.getTime());
      this.filteredCompilations = this.compilations;
    }
  }

  navigateToDetail(compilationId: string) {
    this.router.navigate(['tabs/detail', { id: compilationId }]);
  }

  onSearchChange(event: any) {
    const query = event.target.value.toLowerCase();
    this.applyFilters(query, this.selectedLanguage);
  }

  onLanguageChange(event: any) {
    this.selectedLanguage = event.detail.value;
    this.applyFilters(this.searchTerm, this.selectedLanguage);
  }

  applyFilters(searchTerm: string, language: Language | null) {
    if (this.compilations) {
      this.filteredCompilations = this.compilations.filter(compilation => {
        const matchesSearchTerm = compilation.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLanguage = language === null || compilation.request.language === language;
        return matchesSearchTerm && matchesLanguage;
      });
    }
  }
}