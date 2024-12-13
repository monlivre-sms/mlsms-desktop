import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { TabContent, TabPane, Nav, NavItem, NavLink, Input } from 'reactstrap';

import CKEditor from 'react-ckeditor-component';
import { WithContext as ReactTags } from 'react-tag-input';

class IntlTabLangForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'fr',
        };

        this.getValue = this.getValue.bind(this);
        this.toggle = this.toggle.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.handleAddTag = this.handleAddTag.bind(this);
        this.handleRemoveTag = this.handleRemoveTag.bind(this);
    }

    getValue(lang) {
        if(this.props.translations) {
            const translation = this.props.translations.find(translation => translation.lang === lang);
            if(translation) {
                return translation[this.props.name] || '';
            }
        }
        return '';
    }

    getOtherLanguages() {
        return this.props.enabledLanguages.filter(lang => lang !== 'fr');
    }

    getTags(lang) {
        const tags = this.getValue(lang);
        if(tags) {
            return tags.map((tag, index) => {
                return {
                    id: index,
                    text: tag,
                };
            });
        }
        return [];
    }

    getTagsSuggestions(lang) {
        const suggestions = this.props.suggestions.find(suggestion => suggestion.lang === lang);
        if(suggestions) {
            return suggestions.list;
        }
        return [];
    }

    toggle(tab) {
        if(this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab,
            });
        }
    }

    handleChange(event, lang) {
        this.props.onChange && this.props.onChange(event, lang);
    }

    handleAddTag(tag, lang) {
        let tags = this.getValue(lang);
        if(!tags) {
            tags = [];
        }
        tags.push(tag);
        this.handleChange({
            target: {
                name: this.props.name,
                value: tags,
            },
        }, lang);
    }

    handleRemoveTag(key, lang) {
        let tags = this.getValue(lang);
        if(tags) {
            tags = tags.filter((tag, index) => index !== key);
            this.handleChange({
                target: {
                    name: this.props.name,
                    value: tags,
                },
            }, lang);
        }
    }

    renderTabContent(lang) {
        return (
            <TabPane key={lang} tabId={lang}>
                <div className="p-2">
                    {lang === 'fr' ? this.props.children : this.renderFormElement(lang)}
                </div>
            </TabPane>
        );
    }

    renderFormElement(lang) {
        switch(this.props.type) {
            case 'text':
            case 'textarea':
                return <Input type={this.props.type} name={this.props.name} value={this.getValue(lang)} onChange={event => this.handleChange(event, lang)} />;

            case 'html':
                return (
                    <CKEditor
                        name={this.props.name}
                        content={this.getValue(lang)}
                        events={{
                            'change': event => this.handleChange({ ...event, target: { ...event.target, name: this.props.name, value: event.editor.getData() } }, lang),
                        }}
                    />);

            case 'tags':
                return (<ReactTags
                    tags={this.getTags(lang)}
                    suggestions={this.getTagsSuggestions(lang)}
                    handleDelete={tag => this.handleRemoveTag(tag, lang)}
                    handleAddition={key => this.handleAddTag(key, lang)}
                    autocomplete
                    inline
                    classNames={this.props.classNames}
                />);

            default:
                return null;

        }
    }

    render() {
        if(this.props.enabledLanguages) {
            return (
                <div>
                    <Nav tabs className="nav-secondary">
                        {this.props.enabledLanguages.map((lang, index) => <NavItem key={index}><NavLink className={classnames({ active: this.state.activeTab === lang })} onClick={() => { this.toggle(lang); }}>{lang}</NavLink></NavItem>)}
                    </Nav>
                    <TabContent activeTab={this.state.activeTab}>
                        {this.props.enabledLanguages.map(lang => this.renderTabContent(lang))}
                    </TabContent>
                </div>
            );
        }
        return this.props.children;
    }
}

function mapStateToProps(store, props) {
    return {
        enabledLanguages: store.intl.enabledLanguages,
    };
}

IntlTabLangForm.propTypes = {
    dispatch: PropTypes.func.isRequired,
    enabledLanguages: PropTypes.array.isRequired,
    translations: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    classNames: PropTypes.array,
    suggestions: PropTypes.array,
    children: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
};

export default connect(mapStateToProps)(IntlTabLangForm);
