/*
 * Copyright 2020 Bitnine Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import cytoscape from 'cytoscape';
import cxtmenu from 'cytoscape-cxtmenu'
import { generateCytoscapeElement } from '../../../features/cypher/CypherUtil'
import COSEBilkent from 'cytoscape-cose-bilkent';
import cola from 'cytoscape-cola'
import dagre from 'cytoscape-dagre'
import klay from 'cytoscape-klay'
import euler from 'cytoscape-euler'
import avsdf from 'cytoscape-avsdf'
import spread from 'cytoscape-spread'
import  { initLocation, seletableLayouts} from './CytoscapeLayouts'

cytoscape.use(COSEBilkent);
cytoscape.use(cola);
cytoscape.use(dagre);
cytoscape.use(klay);
cytoscape.use(euler);
cytoscape.use(avsdf);
cytoscape.use(spread);
cytoscape.use(cxtmenu);

let selectedLabel = {
  node: {},
  edge: {}
}

const getLabel = (ele, captionProp) => {
  if (captionProp === 'gid') {
    ele.isNode() ? selectedLabel.node[ele.data('label')] = 'gid' : selectedLabel.edge[ele.data('label')] = 'gid'
    return "[ " + ele.data('id') + " ]"
  } else if (captionProp === 'label') {
    ele.isNode() ? selectedLabel.node[ele.data('label')] = 'label' : selectedLabel.edge[ele.data('label')] = 'label'
    return "[ :" + ele.data('label') + " ]"
  } else {
    const props = ele.data('properties')
    if (props[captionProp] === undefined) {
      ele.isNode() ? selectedLabel.node[ele.data('label')] = 'gid' : selectedLabel.edge[ele.data('label')] = 'gid'
      return "[ " + ele.data('id') + " ]"
    }
    else {
      ele.isNode() ? selectedLabel.node[ele.data('label')] = captionProp : selectedLabel.edge[ele.data('label')] = captionProp
      return props[captionProp]
    }
  }
}

const stylesheet = [
  {
    selector: 'node',
    style: {
      width: function (ele) { return ele == null ? 55 : ele.data('size'); },
      height: function (ele) { return ele == null ? 55 : ele.data('size'); },
      label: function (ele) { const captionProp = ele.data('caption'); return ele == null ? '' : getLabel(ele, captionProp); },
      'background-color': function (ele) { return ele == null ? '#FFF' : ele.data('backgroundColor'); },
      'border-width': "3px",
      'border-color': function (ele) { return ele == null ? '#FFF' : ele.data('borderColor'); },
      'border-opacity': 0.6,
      "text-valign": "center",
      "text-halign": "center",
      color: function (ele) { return ele == null ? '#FFF' : ele.data('fontColor'); },
      "font-size": "10px",
      "text-wrap": "ellipsis",
      "text-max-width": function (ele) { return ele == null ? 55 : ele.data('size'); }
    }
  },
  {
    selector: 'node.highlight',
    style: {
      'border-width': "6px",
      'border-color': "#B2EBF4"
    }
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': "6px",
      'border-color': "#B2EBF4"
    }
  },
  {
    selector: 'edge',
    style: {
      width: function (ele) { return ele == null ? 1 : ele.data('size'); },
      label: function (ele) { const captionProp = ele.data('caption'); return ele == null ? '' : getLabel(ele, captionProp); },
      'text-background-color': '#FFF',
      'text-background-opacity': 1,
      'text-background-padding': '3px',
      'line-color': function (ele) { return ele == null ? '#FFF' : ele.data('backgroundColor'); },
      'target-arrow-color': function (ele) { return ele == null ? '#FFF' : ele.data('backgroundColor'); },
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      color: function (ele) { return ele == null ? '#FFF' : ele.data('fontColor'); },
      "font-size": "10px",
      "text-rotation": "autorotate"
    }
  },
  {
    selector: 'edge.highlight',
    style: {
      width: function (ele) { return ele == null ? 1 : ele.data('size'); },
      'line-color': "#B2EBF4",
      'target-arrow-color': "#B2EBF4",
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier'
    }
  },
  {
    selector: 'edge:selected',
    style: {
      width: function (ele) { return ele == null ? 1 : ele.data('size'); },
      'line-color': "#B2EBF4",
      'target-arrow-color': "#B2EBF4",
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier'
    }
  }
]

const defaultLayout = seletableLayouts.coseBilkent

const conf = {
  // Common Options
  style: stylesheet,
  layout: defaultLayout,
  // Viewport Options
  zoom: 1,
  // Interaction Options
  minZoom: 0.5,
  maxZoom: 2,
  zoomingEnabled: false, //true
  userZoomingEnabled: false, //true
  panningEnabled: true,
  userPanningEnabled: true,
  boxSelectionEnabled: false, //true
  selectionType: 'single',
  touchTapThreshold: 8,
  desktopTapThreshold: 4,
  autolock: false,
  autoungrabify: false,
  autounselectify: false,
  // Rendering Options
  headless: false,
  styleEnabled: true,
  hideEdgesOnViewport: false,
  textureOnViewport: false,
  motionBlur: false,
  motionBlurOpacity: 0.2,
  wheelSensitivity: 1,
  pixelRatio: 'auto'
};




class CytoscapeComponent extends Component {
  constructor(props) {
    super(props);
    this.cy = ''
    this.menu = ''
    this.addElements = this.addElements.bind(this)
  }

  closeCxtmenu() {
    this.menu.destroy()
  }

  addElements(centerId, d) {
    const generatedData = generateCytoscapeElement( d, true )
    if (generatedData.elements.nodes.length === 0) {
      alert("No data to extend.")
      return
    }

    this.cy.elements().lock()
    this.cy.add(generatedData.elements)
    const newlyAddedEdges = this.cy.edges('.new')
    const newlyAddedTargets = newlyAddedEdges.targets()
    const newlyAddedSources = newlyAddedEdges.sources()
    let rerenderEles = newlyAddedEdges.union(newlyAddedTargets).union(newlyAddedSources)

    const certerPosition = Object.assign({}, this.cy.nodes().getElementById(centerId).position())
    this.cy.elements().unlock()
    rerenderEles.layout(seletableLayouts.concentric).run()

    const certerMovedPosition = Object.assign({}, this.cy.nodes().getElementById(centerId).position())
    const xGap = certerMovedPosition.x - certerPosition.x
    const yGap = certerMovedPosition.y - certerPosition.y
    rerenderEles.forEach((ele) => {
      const pos = ele.position()
      ele.position({ x : pos.x - xGap, y : pos.y - yGap })
    })

    this.handleUserAction(this.props, true)
    this.props.addLegendData(generatedData.legend)

    rerenderEles.removeClass('new')
  }

  handleUserAction(props, areNewElements) {
    const targetElements = areNewElements ? this.cy.elements('.new') : this.cy.elements()

    targetElements.bind('mouseover', (e) => {
      props.onElementsMouseover({ type: 'elements', data: e.target.data() })
      e.target.addClass('highlight')
    })

    targetElements.bind('mouseout', (e) => {
      if (this.cy.elements(':selected').length === 0) {
        props.onElementsMouseover({ type: 'background', data: { nodeCount: this.cy.nodes().size(), edgeCount: this.cy.edges().size() } })
      } else {
        props.onElementsMouseover({ type: 'elements', data: this.cy.elements(':selected')[0].data() })
      }

      e.target.removeClass('highlight')
    })

    targetElements.bind('click', (e) => {
      const ele = e.target
      if (ele.selected() && ele.isNode()) {
        if (this.cy.nodes(':selected').size() === 1) {
          ele.neighborhood().selectify().select().unselectify()
        } else {
          this.cy.nodes(':selected').filter('[id != "'+ele.id()+'"]').neighborhood().selectify().select().unselectify()
        }
      } else {
        this.cy.elements(':selected').unselect().selectify()
      }
    })

    this.cy.bind('click', (e) => {
      if (e.target === this.cy) {
        this.cy.elements(':selected').unselect().selectify()
        props.onElementsMouseover({ type: 'background', data: { nodeCount: this.cy.nodes().size(), edgeCount: this.cy.edges().size() } })
      }
    })
  }

  componentDidMount() {
    conf.container = this.refs.cyelement;
    conf.pan = { x: this.refs.cyelement.offsetWidth / 3, y: 50 }
    let initCy = cytoscape(conf);
    this.cy = initCy


    this.cxtMenuConf = {
      menuRadius: 75,
      selector: 'node',
      commands: [
        {
          content: '<span class=""  ><i class="fas fa-lock-open fa-lg"></i></span>',
          select: function (ele) {
            ele.animate({ position: initLocation[ele.id()] })
          }
        },

        {
          content: '<span class=""><i class="fas fa-project-diagram fa-lg"></i></span>',
          select: function (ele) {
            fetch('/api/v1/cypher',
              {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cmd: 'MATCH (S)-[R]-(T) WHERE id(S) = \'' + ele.id() + '\' RETURN S, R, T' })
              })
              .then(res => res.json())
              .then(data => {
                this.addElements(ele.id(), data)
              })
          }.bind(this)
        },

        {
          content: '<span class=""><i class="fas fa-eye-slash fa-lg"></i></span>',
          select: function (ele) {
            ele.remove()
          }
        },

        {
          content: '<span class=""><i class="far fa-window-close fa-lg"></i></span>',
          select: function (ele) {
          }
        }
      ],
      fillColor: 'rgba(210, 213, 218, 1)',
      activeFillColor: 'rgba(166, 166, 166, 1)',
      activePadding: 0,
      indicatorSize: 0,
      separatorWidth: 4,
      spotlightPadding: 3,
      minSpotlightRadius: 11,
      maxSpotlightRadius: 99,
      openMenuEvents: 'cxttap',
      itemColor: '#2A2C34',
      itemTextShadowColor: 'transparent',
      zIndex: 9999,
      atMouse: false
    }
    this.menu = initCy.cxtmenu(this.cxtMenuConf)
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.elements.nodes.length === 0) {
      this.cy.add(nextProps.elements)
      this.cy.layout(defaultLayout).run()

      this.handleUserAction(nextProps, false)

    } else {
      if (nextProps.legendData !== undefined) {

        for (const [label, legend] of Object.entries(nextProps.legendData.nodeLegend)) {
          this.colorChange('node', label, {color : legend.color, borderColor : legend.borderColor, fontColor : legend.fontColor})
          this.sizeChange('node', label, legend.size)
          this.captionChange('node', label, legend.caption)
        }

        for (const [label, legend] of Object.entries(nextProps.legendData.edgeLegend)) {
          this.colorChange('edge', label, {color : legend.color, borderColor : legend.borderColor, fontColor : legend.fontColor})
          this.sizeChange('edge', label, legend.size)
          this.captionChange('edge', label, legend.caption)
        }
      }
      this.cy.resize()
    }
  }

  componentWillUnmount() {
    this.menu.destroy()
    this.cy.destroy()
  }


  resetChart() {
    this.props.elements.nodes = []
    this.props.elements.edges = []
    this.cy.elements().remove()
  }

  getCaptions(elementType, label) {
    const eles = this.cy.elements(elementType + '[label = "' + label + '"]').jsons()
    let extendedSet = new Set([])
    eles.forEach((ele) => {
      extendedSet = new Set([...extendedSet, ...Object.keys(ele.data.properties)])
    })
    return extendedSet
  }

  getCurrecntCaption(elementType, label) {
    if (elementType === 'edge' && selectedLabel[elementType][label] === undefined) {
      selectedLabel[elementType][label] = 'label'
    }

    return selectedLabel[elementType][label]
  }

  getCy() {
    return this.cy;
  }

  colorChange(elementType, label, color) {
    let c = {}

    if (Array.isArray(color)) {
      c['color'] = color[0]
      c['borderColor'] = color[1]
      c['fontColor'] = color[2]
    } else {
      c = color
    }


    if (elementType === 'node') {
      this.cy.nodes('[label = "' + label + '"]').data("backgroundColor", c.color).data("borderColor", c.borderColor).data("fontColor", c.fontColor)
    } else if (elementType === 'edge') {
      this.cy.edges('[label = "' + label + '"]').data("backgroundColor", c.color).data("fontColor", c.fontColor).data("fontColor", '#2A2C34')
    }

  }

  sizeChange(elementType, label, size) {
    const changedData = this.cy.elements(elementType + '[label = "' + label + '"]').data("size", size)

    if (size > 6) {
      changedData.style('text-background-opacity', 0)
    } else {
      changedData.style('text-background-opacity', 1)
    }
  }

  captionChange(elementType, label, caption) {
    if (caption === 'gid') {
      this.cy.elements(elementType + '[label = "' + label + '"]').style('label', function (ele) { return ele == null ? '' : "[ " + ele.data('id') + " ]"; })
    } else if (caption === 'label') {
      this.cy.elements(elementType + '[label = "' + label + '"]').style('label', function (ele) { return ele == null ? '' : "[ :" + ele.data('label') + " ]"; })
    } else {
      this.cy.elements(elementType + '[label = "' + label + '"]').style('label', function (ele) { return ele == null ? '' : (ele.data('properties')[caption] == null ? '' : ele.data('properties')[caption]) })
    }
  }

  layoutChange(layoutName) {
    if (seletableLayouts.hasOwnProperty(layoutName)) {
      const selectedLayout = seletableLayouts[layoutName]
      selectedLayout.animate = true
      this.cy.layout(selectedLayout).run()
    }
  }

  render() {
    return <div id="cyto" className="chart-area" ref="cyelement" />
  }
}

export default CytoscapeComponent;